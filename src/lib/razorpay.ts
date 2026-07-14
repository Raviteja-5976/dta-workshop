import { isMock } from '@/lib/supabase/config';

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

interface RazorpayPaymentLinkResponse {
  id: string;
  short_url: string;
  status: string;
}

/**
 * Creates a Razorpay Payment Link for a registration.
 * If credentials are not configured or in mock mode, it returns a simulated payment link.
 * 
 * @param registrationId The registration UUID.
 * @param amountInRupees The amount in Rupees (INR).
 * @param customer The customer name, email, and optional phone.
 * @param description Description of the workshop run.
 */
export async function createRazorpayPaymentLink(
  registrationId: string,
  amountInRupees: number,
  customer: CustomerInfo,
  description: string
): Promise<RazorpayPaymentLinkResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isRazorpayMock =
    isMock ||
    !keyId ||
    !keySecret ||
    keyId.includes('your_key_id') ||
    keySecret.includes('your_key_secret');

  if (isRazorpayMock) {
    // Generate a mock payment link for testing
    const mockId = `plink_mock_${Math.random().toString(36).substring(2, 11)}`;
    // We will route mock payment checkout internally
    const mockUrl = `/payments/mock-checkout?regId=${registrationId}&amount=${amountInRupees}`;
    return {
      id: mockId,
      short_url: mockUrl,
      status: 'created',
    };
  }

  // Razorpay expects amount in paise (1 INR = 100 Paise)
  const amountInPaise = Math.round(amountInRupees * 100);

  // After a successful payment Razorpay redirects the customer here (GET with
  // razorpay_payment_id / _link_id / _reference_id / _status / signature appended).
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://workshop.devtrackacademy.com').replace(/\/$/, '');
  const callbackUrl = `${siteUrl}/payments/success`;

  // Clean phone number (Razorpay requires phone to include country code or be a valid string)
  let contact = customer.phone?.replace(/[^0-9+]/g, '');
  if (contact && !contact.startsWith('+')) {
    // Default to Indian country code if 10 digits
    if (contact.length === 10) {
      contact = `+91${contact}`;
    }
  }

  try {
    const authHeader = btoa(`${keyId}:${keySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        accept_partial: false,
        reference_id: registrationId,
        description: description.substring(0, 100), // Max 100 characters in description
        callback_url: callbackUrl,
        callback_method: 'get',
        customer: {
          name: customer.name,
          email: customer.email,
          ...(contact ? { contact } : {}),
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: false,
        notes: {
          registration_id: registrationId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay Payment Link API Error:', errorText);
      throw new Error(`Razorpay API responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      short_url: data.short_url,
      status: data.status,
    };
  } catch (error) {
    console.error('Failed to create Razorpay payment link:', error);
    throw error;
  }
}
