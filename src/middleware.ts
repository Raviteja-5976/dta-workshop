import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We gate all routes under /admin, excluding the login and verification pages
  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    pathname !== '/admin/verify' &&
    !pathname.startsWith('/admin/api')
  ) {
    // 1. Validate the admin session verification cookie
    const adminSession = request.cookies.get('dta_admin_session')?.value;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-key-at-least-32-chars-long';
    
    let isSessionValid = false;
    if (adminSession) {
      const payload = await verifySession(adminSession, secret);
      if (payload && payload.userId) {
        isSessionValid = true;
      }
    }

    if (!isSessionValid) {
      // 2. Verify Supabase Session to redirect to login or passcode entry
      let supabaseUser = null;
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');

      if (isSupabaseConfigured) {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({
                  request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                  response.cookies.set(name, value, options)
                );
              },
            },
          }
        );

        const { data: { user } } = await supabase.auth.getUser();
        supabaseUser = user;
      } else {
        // Look for mock user in request cookies
        const mockUserCookie = request.cookies.get('sb-mock-session')?.value;
        if (mockUserCookie) {
          try {
            supabaseUser = JSON.parse(decodeURIComponent(mockUserCookie));
          } catch (e) {}
        }
      }

      if (!supabaseUser) {
        // Not logged in to Supabase, go to login
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      } else {
        // Logged in but passcode not verified, go to passcode verify
        const url = request.nextUrl.clone();
        url.pathname = '/admin/verify';
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
