import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isMock } from '@/lib/supabase/config';

const encoder = new TextEncoder();

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSession(payload: any, secret: string): Promise<string> {
  const data = JSON.stringify(payload);
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${btoa(data)}.${signatureHex}`;
}

export async function verifySession(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [dataB64, signatureHex] = parts;
    const dataStr = atob(dataB64);
    const key = await getCryptoKey(secret);
    
    // Reconstruct signature bytes from hex
    const signatureBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(dataStr)
    );
    
    if (!isValid) return null;
    
    const payload = JSON.parse(dataStr);
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Session expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Asserts that the current request is from an authenticated and verified administrator.
 * Throws an error if authentication or verification checks fail.
 */
export async function assertAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dta_admin_session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No admin session cookie.');
  }

  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-at-least-32-chars-long';
  const payload = await verifySession(sessionCookie, secret);
  if (!payload || !payload.userId) {
    throw new Error('Unauthorized: Invalid admin session.');
  }

  if (isMock) {
    return { userId: payload.userId };
  }

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', payload.userId)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: User is not an admin.');
  }

  return { userId: payload.userId };
}
