import Script from 'next/script';

// Google Analytics (GA4 / gtag.js). Loaded via next/script with the
// `afterInteractive` strategy — the recommended approach for tag managers /
// analytics. Renders nothing unless NEXT_PUBLIC_GA_ID is set, so analytics is
// trivially disabled per-environment (e.g. leave it unset in local dev).
//
// GA4 "Enhanced measurement" (on by default in the property) auto-tracks page
// views across App Router client navigations (History API) plus outbound clicks,
// scrolls, file downloads and form interactions — so page visits and clicks are
// captured without extra code.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
