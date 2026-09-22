import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { logger } from './logger';

export interface OrderItemPayload {
  productId?: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
}

export interface OrderNotificationPayload {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address?: string;
  city?: string;
  postcode?: string;
  total_amount: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items?: OrderItemPayload[];
  created_at?: string;
}

export interface EmailDispatchRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  status: 'Shipped' | 'Delivered';
  subject: string;
  sentAt: string;
  delivered: boolean;
  provider: 'resend' | 'smtp' | 'preview';
  messageId?: string;
  htmlContent: string;
  textContent: string;
  note?: string;
}

// In-memory store for recent email dispatches to inspect in the Admin Panel
const dispatchHistory: EmailDispatchRecord[] = [];

export function getEmailDispatchHistory(): EmailDispatchRecord[] {
  return [...dispatchHistory].reverse();
}

export function formatNaira(amount: number): string {
  return `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export function buildOrderStatusEmail(order: OrderNotificationPayload, status: 'Shipped' | 'Delivered') {
  const isShipped = status === 'Shipped';
  const subject = isShipped
    ? `Your DIRACE Order #${order.id} Has Shipped`
    : `Your DIRACE Order #${order.id} Has Been Delivered`;

  const headline = isShipped ? 'Piece Dispatched & En Route' : 'Package Delivered';
  const badgeText = isShipped ? 'STATUS: IN TRANSIT' : 'STATUS: DELIVERED';
  const badgeColor = isShipped ? '#9e5d2b' : '#23633d';
  const badgeBg = isShipped ? '#f9f1e8' : '#eaf4ee';

  const clientName = order.customer_name?.trim() || 'Valued Client';
  const destination = [order.shipping_address, order.city, order.postcode, 'Nigeria']
    .filter(Boolean)
    .join(', ');

  const itemsList = order.items && order.items.length > 0 ? order.items : [];

  const itemsHtml = itemsList
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eae7e1; font-size: 13px; color: #1a1918;">
          <strong>${item.name}</strong>${item.size ? ` <span style="color: #7d776f; font-family: monospace; font-size: 11px;">(${item.size})</span>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eae7e1; text-align: center; font-size: 13px; color: #7d776f; font-family: monospace;">
          ×${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eae7e1; text-align: right; font-size: 13px; color: #1a1918; font-family: monospace; font-weight: 500;">
          ${formatNaira(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f7f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1b1a; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e2db; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03);" cellpadding="0" cellspacing="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 28px; background-color: #1a1918; text-align: center;">
              <h1 style="margin: 0; font-family: 'Cinzel', Georgia, serif; font-size: 20px; letter-spacing: 0.22em; color: #fbfaf8; text-transform: uppercase;">
                DIRACE
              </h1>
              <p style="margin: 6px 0 0; font-family: monospace; font-size: 10px; letter-spacing: 0.18em; color: #a9a49d; text-transform: uppercase;">
                Lagos Studio · Nigeria
              </p>
            </td>
          </tr>

          <!-- Notification Banner -->
          <tr>
            <td style="padding: 28px 36px 20px; border-bottom: 1px solid #edebe6;">
              <div style="display: inline-block; padding: 4px 10px; background-color: ${badgeBg}; color: ${badgeColor}; font-family: monospace; font-size: 11px; letter-spacing: 0.12em; font-weight: 600; border-radius: 2px; margin-bottom: 14px;">
                ${badgeText}
              </div>
              <h2 style="margin: 0 0 10px; font-size: 21px; font-weight: 500; color: #141312; letter-spacing: -0.01em;">
                ${headline}
              </h2>
              <p style="margin: 0; font-size: 14px; color: #57534e; line-height: 1.6;">
                Dear ${clientName},
              </p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #57534e; line-height: 1.6;">
                ${
                  isShipped
                    ? `Your order <strong style="font-family: monospace; color: #1a1918;">#${order.id}</strong> has been hand-inspected, packed, and dispatched from our Lagos studio for courier delivery.`
                    : `Your order <strong style="font-family: monospace; color: #1a1918;">#${order.id}</strong> has been confirmed as delivered to your address. We hope this piece becomes a lasting staple of your wardrobe.`
                }
              </p>
            </td>
          </tr>

          <!-- Dispatch Destination -->
          <tr>
            <td style="padding: 20px 36px; background-color: #faf9f6; border-bottom: 1px solid #edebe6;">
              <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.14em; color: #8c867f; text-transform: uppercase; margin-bottom: 6px;">
                ${isShipped ? 'Delivery Destination' : 'Delivered To'}
              </div>
              <div style="font-size: 13px; color: #1c1b1a; line-height: 1.5; font-weight: 500;">
                ${destination || 'Standard Delivery Address'}
              </div>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 28px 36px 20px;">
              <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.14em; color: #8c867f; text-transform: uppercase; margin-bottom: 12px;">
                Order Summary
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding: 16px 0 0; font-size: 14px; font-weight: 600; color: #1a1918;">
                    Total Amount
                  </td>
                  <td style="padding: 16px 0 0; text-align: right; font-size: 16px; font-weight: 700; color: #1a1918; font-family: monospace;">
                    ${formatNaira(order.total_amount)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reflection / Care Note -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f7f5f1; border-top: 1px solid #edebe6; border-bottom: 1px solid #edebe6;">
              <p style="margin: 0; font-size: 12px; color: #69645d; line-height: 1.6;">
                ${
                  isShipped
                    ? 'Our courier partner will contact you upon arrival. If you require specialized delivery instructions, please reply directly to this notification.'
                    : 'Each DIRACE piece is crafted in small runs for longevity. We invite you to inspect your garment and leave your reflection in our client archive.'
                }
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #827c75;">
                DIRACE Atelier & Studio · Victoria Island, Lagos, Nigeria
              </p>
              <p style="margin: 6px 0 0; font-family: monospace; font-size: 11px; color: #9c968f;">
                Direct inquiries: <a href="mailto:studio@dirace.com" style="color: #1a1918; text-decoration: underline;">studio@dirace.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
DIRACE STUDIO — LAGOS, NIGERIA
=======================================
${subject.toUpperCase()}

Dear ${clientName},

${
  isShipped
    ? `Your order #${order.id} has been carefully tailored, inspected, and dispatched from our Lagos studio for courier delivery.`
    : `Your order #${order.id} has been delivered to your destination.`
}

${isShipped ? 'DELIVERY DESTINATION' : 'DELIVERED TO'}:
${destination}

ORDER DETAILS:
${itemsList.map((it) => `- ${it.name} (${it.size || 'Standard'}) x${it.quantity} — ${formatNaira(it.price * it.quantity)}`).join('\n')}

TOTAL AMOUNT: ${formatNaira(order.total_amount)}

${
  isShipped
    ? 'Our courier partner will contact you upon arrival at your address.'
    : 'We invite you to share your reflection on your piece in the DIRACE client archive.'
}

Need assistance? Contact studio@dirace.com.
DIRACE Studio · Victoria Island, Lagos, Nigeria
  `.trim();

  return { subject, html, text };
}

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

let smtpTransporter: nodemailer.Transporter | null = null;
function getSmtpTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;

  if (!smtpTransporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
  return smtpTransporter;
}

export async function sendOrderStatusEmail(
  order: OrderNotificationPayload,
  status: 'Shipped' | 'Delivered'
): Promise<{
  success: boolean;
  delivered: boolean;
  provider: 'resend' | 'smtp' | 'preview';
  recipient: string;
  subject: string;
  messageId?: string;
  note?: string;
  dispatchId: string;
}> {
  const dispatchId = `disp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const recipient = order.customer_email?.trim();

  if (!recipient || !recipient.includes('@')) {
    throw new Error('Valid customer email address is required to dispatch notification.');
  }

  const { subject, html, text } = buildOrderStatusEmail(order, status);
  const fromAddress =
    process.env.STUDIO_SENDER_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'DIRACE Studio <orders@dirace.com>';

  const resend = getResend();
  const smtp = getSmtpTransporter();

  let delivered = false;
  let provider: 'resend' | 'smtp' | 'preview' = 'preview';
  let messageId: string | undefined;
  let note: string | undefined;

  if (resend) {
    try {
      // If using Resend without custom domain, default verified sandbox sender is onboarding@resend.dev
      const safeFrom = fromAddress.includes('@') ? fromAddress : 'DIRACE Studio <onboarding@resend.dev>';
      const res = await resend.emails.send({
        from: safeFrom,
        to: recipient,
        subject,
        html,
        text,
      });

      if (res.error) {
        logger.warn({ error: res.error }, 'Resend API returned error, recording dispatch preview');
        note = `Resend Notice: ${res.error.message}`;
      } else {
        delivered = true;
        provider = 'resend';
        messageId = res.data?.id;
        note = 'Email delivered via Resend API.';
      }
    } catch (err: any) {
      logger.warn({ err }, 'Exception attempting Resend email dispatch');
      note = `Resend attempt: ${err.message}`;
    }
  } else if (smtp) {
    try {
      const info = await smtp.sendMail({
        from: fromAddress,
        to: recipient,
        subject,
        html,
        text,
      });
      delivered = true;
      provider = 'smtp';
      messageId = info.messageId;
      note = 'Email delivered via SMTP.';
    } catch (err: any) {
      logger.warn({ err }, 'Exception attempting SMTP email dispatch');
      note = `SMTP attempt: ${err.message}`;
    }
  }

  if (!delivered) {
    provider = 'preview';
    note = note || 'Notification rendered & queued. Connect RESEND_API_KEY or SMTP_HOST in Settings for live external inbox relay.';
    logger.info(
      {
        orderId: order.id,
        recipient,
        status,
        subject,
        provider,
      },
      'Client status email composed and recorded'
    );
  }

  const record: EmailDispatchRecord = {
    id: dispatchId,
    orderId: order.id,
    customerName: order.customer_name || 'Client',
    customerEmail: recipient,
    status,
    subject,
    sentAt: new Date().toISOString(),
    delivered,
    provider,
    messageId,
    htmlContent: html,
    textContent: text,
    note,
  };

  dispatchHistory.push(record);
  if (dispatchHistory.length > 200) {
    dispatchHistory.shift();
  }

  return {
    success: true,
    delivered,
    provider,
    recipient,
    subject,
    messageId,
    note,
    dispatchId,
  };
}
