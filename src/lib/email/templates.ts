// Neo-brutalist HTML email templates matching the DevTrackAcademy site theme.
// Built with inline styles + tables for broad email-client support. The chunky
// "hard shadow" look is faked with thick bottom/right borders (box-shadow is
// unreliable in email clients).

// Brand palette (mirrors src/app/globals.css @theme)
const NAVY = '#1B1F3B';
const ORANGE = '#FF6B35';
const CREAM = '#FFF8F0';
const YELLOW = '#FFD54F';
const MINT = '#6EE7B7';
const WHITE = '#FFFFFF';

export const SUPPORT_EMAIL = 'support@devtrackacademy.com';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://workshop.devtrackacademy.com').replace(/\/+$/, '');
const LOGO_URL =
  'https://i.ibb.co/1YkVxXBc/Logo-remove-text-2-K-202607062237-removebg-preview.png';

const DISPLAY_FONT = "'Space Grotesk', 'Segoe UI', Arial, sans-serif";
const BODY_FONT = "Arial, 'Segoe UI', sans-serif";
const P = `margin:0 0 14px; font-family:${BODY_FONT}; font-size:15px; line-height:1.6; color:${NAVY};`;

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

function button(label: string, url: string, bg: string = ORANGE, color: string = WHITE): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0;">
    <tr>
      <td style="background:${bg}; border:3px solid ${NAVY}; border-bottom-width:6px; border-right-width:6px; border-radius:14px;">
        <a href="${url}" target="_blank" style="display:inline-block; padding:14px 30px; font-family:${DISPLAY_FONT}; font-weight:800; font-size:16px; text-transform:uppercase; letter-spacing:0.5px; color:${color}; text-decoration:none;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

interface LayoutOpts {
  preheader: string;
  badge?: string;
  heading: string;
  bodyHtml: string;
}

function baseLayout({ preheader, badge, heading, bodyHtml }: LayoutOpts): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0; padding:0; background:${CREAM}; -webkit-text-size-adjust:100%;">
<span style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM}; padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">
        <tr>
          <td align="center" style="padding:6px 0 20px;">
            <img src="${LOGO_URL}" alt="DevTrackAcademy" width="140" style="display:block; border:0; outline:none; text-decoration:none; height:auto;" />
          </td>
        </tr>
        <tr>
          <td style="background:${WHITE}; border:3px solid ${NAVY}; border-bottom-width:8px; border-right-width:8px; border-radius:24px; padding:32px 28px;">
            ${
              badge
                ? `<div style="display:inline-block; background:${YELLOW}; border:2px solid ${NAVY}; border-radius:999px; padding:5px 14px; font-family:${DISPLAY_FONT}; font-weight:800; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:${NAVY};">${escapeHtml(badge)}</div>`
                : ''
            }
            <h1 style="margin:16px 0 14px; font-family:${DISPLAY_FONT}; font-weight:800; font-size:28px; line-height:1.15; color:${NAVY};">${escapeHtml(heading)}</h1>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:22px 16px 8px;">
            <p style="margin:0 0 6px; font-family:${BODY_FONT}; font-size:12px; font-weight:bold; color:${NAVY};">DevTrackAcademy — Learn. Build. Deploy. Repeat.</p>
            <p style="margin:0; font-family:${BODY_FONT}; font-size:11px; color:rgba(27,31,59,0.6);">
              <a href="${SITE_URL}" target="_blank" style="color:${ORANGE}; text-decoration:none; font-weight:bold;">workshop.devtrackacademy.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function welcomeEmailHtml({ name }: { name: string }): string {
  const body = `
    <p style="${P}">Hey <strong>${escapeHtml(name)}</strong> 👋,</p>
    <p style="${P}">Welcome to <strong>DevTrackAcademy</strong> — you're in! We run small-batch, mentor-led coding workshops where you actually write and ship real code, live.</p>
    <p style="${P}">Ready to jump in? Explore our live and upcoming workshops and grab your seat.</p>
    ${button('Explore Workshops', `${SITE_URL}/workshops`)}
    <div style="height:1px; background:rgba(27,31,59,0.12); margin:22px 0;"></div>
    <p style="margin:0; font-family:${BODY_FONT}; font-size:11px; line-height:1.6; color:rgba(27,31,59,0.55);">
      You'll receive our newsletter with new workshops, resources and updates by default. If you'd rather not, just email
      <a href="mailto:${SUPPORT_EMAIL}" style="color:${ORANGE}; text-decoration:none;">${SUPPORT_EMAIL}</a> and we'll take you off the list.
    </p>`;

  return baseLayout({
    preheader: 'Welcome to DevTrackAcademy — explore live coding workshops.',
    badge: 'Welcome aboard',
    heading: 'Welcome to DevTrackAcademy!',
    bodyHtml: body,
  });
}

interface ConfirmationParams {
  name: string;
  workshopTitle: string;
  batchLabel?: string;
  dateLabel?: string;
  amount?: number;
  confirmationCode?: string;
}

export function registrationConfirmedEmailHtml({
  name,
  workshopTitle,
  batchLabel,
  dateLabel,
  amount,
  confirmationCode,
}: ConfirmationParams): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:9px 0; font-family:${BODY_FONT}; font-size:13px; color:rgba(27,31,59,0.6); border-bottom:1px solid rgba(27,31,59,0.08);">${escapeHtml(label)}</td>
      <td align="right" style="padding:9px 0; font-family:${DISPLAY_FONT}; font-weight:700; font-size:14px; color:${NAVY}; border-bottom:1px solid rgba(27,31,59,0.08);">${value}</td>
    </tr>`;

  const details = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM}; border:2px solid ${NAVY}; border-radius:16px; padding:4px 16px; margin:8px 0 18px;">
      ${row('Workshop', escapeHtml(workshopTitle))}
      ${batchLabel ? row('Batch', escapeHtml(batchLabel)) : ''}
      ${dateLabel ? row('Schedule', escapeHtml(dateLabel)) : ''}
      ${amount != null ? row('Amount Paid', amount === 0 ? 'FREE' : `₹${amount}`) : ''}
      ${confirmationCode ? row('Confirmation Code', escapeHtml(confirmationCode)) : ''}
    </table>`;

  const body = `
    <p style="${P}">Hi <strong>${escapeHtml(name)}</strong>, your payment was successful and your seat is <strong>confirmed</strong> 🎉</p>
    ${details}
    <p style="${P}">Everything for your workshop — session schedule, live join links, assignments and resources — lives in your dashboard.</p>
    ${button('Go to Dashboard', `${SITE_URL}/dashboard`, MINT, NAVY)}
    <p style="margin:14px 0 0; font-family:${BODY_FONT}; font-size:12px; color:rgba(27,31,59,0.6);">See you in class! Questions? Reply to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${ORANGE}; text-decoration:none;">${SUPPORT_EMAIL}</a>.</p>`;

  return baseLayout({
    preheader: `You're confirmed for ${workshopTitle}.`,
    badge: 'Payment confirmed',
    heading: "You're all set! 🎉",
    bodyHtml: body,
  });
}
