import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ShareSteak <onboarding@resend.dev>';

    const { type, to, data } = await request.json();

    if (!type || !to) {
      return NextResponse.json({ error: 'type and to are required' }, { status: 400 });
    }

    const email = getEmailContent(type, data);
    if (!email) {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: email.subject,
      html: email.html,
    });

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getEmailContent(type: string, data: any): { subject: string; html: string } | null {
  switch (type) {
    case 'order_confirmation':
      return {
        subject: `🥩 Order Confirmed! #${data.orderNumber}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 16px; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🥩 ShareSteak</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Order Confirmed!</p>
            </div>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
              <h2 style="margin: 0; color: #166534;">Thank you for your order!</h2>
              <p style="color: #15803d; margin: 8px 0 0;">Order #${data.orderNumber || 'N/A'}</p>
            </div>

            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px; color: #111;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">$${(data.subtotal || 0).toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right;">${data.shipping === 0 ? '<span style="color: #16a34a;">FREE</span>' : '$' + (data.shipping || 0).toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0; color: #6b7280;">Tax (GST)</td>
                  <td style="padding: 8px 0; text-align: right;">$${(data.tax || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: 700; font-size: 18px;">Total</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #dc2626;">$${(data.total || 0).toFixed(2)} CAD</td>
                </tr>
              </table>
            </div>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; color: #1e40af;">📦 What's Next?</h3>
              <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
                <li style="margin-bottom: 8px;">The seller is preparing your order</li>
                <li style="margin-bottom: 8px;">You'll receive a tracking number when shipped</li>
                <li>Estimated delivery: <strong>${data.estimatedDelivery || '3-5 business days'}</strong></li>
              </ol>
            </div>

            <div style="text-align: center; padding: 20px 0;">
              <a href="${data.appUrl || 'http://localhost:3000'}/orders" style="display: inline-block; background: #dc2626; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View My Orders</a>
            </div>

            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">ShareSteak — Quality Meat, Direct from Producers</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0;">Calgary, AB, Canada</p>
            </div>
          </div>
        `,
      };

    case 'welcome':
      return {
        subject: '🥩 Welcome to ShareSteak!',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 16px; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 32px;">🥩 Welcome to ShareSteak!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 16px;">Quality meat, direct from producers</p>
            </div>

            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 16px;">Hey ${data.firstName || 'there'}! 👋</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Thanks for joining ShareSteak! Here's what you can do:
              </p>
              <ul style="color: #4b5563; line-height: 2;">
                <li>🥩 <strong>Browse</strong> premium meat from local producers</li>
                <li>👥 <strong>Join group purchases</strong> for wholesale prices</li>
                <li>💬 <strong>Connect</strong> with the community</li>
                <li>⭐ <strong>Review</strong> products you love</li>
              </ul>
            </div>

            <div style="text-align: center; padding: 20px 0;">
              <a href="${data.appUrl || 'http://localhost:3000'}/products" style="display: inline-block; background: #dc2626; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Shopping 🛒</a>
            </div>
          </div>
        `,
      };

    case 'order_shipped':
      return {
        subject: `🚚 Your order #${data.orderNumber} has shipped!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 16px; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0;">🚚 Your order is on its way!</h1>
            </div>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
              <p style="color: #4b5563;">Order <strong>#${data.orderNumber}</strong> has been shipped.</p>
              ${data.trackingNumber ? `<p style="color: #4b5563;">Tracking: <strong>${data.trackingNumber}</strong></p>` : ''}
              <p style="color: #4b5563;">Estimated delivery: <strong>${data.estimatedDelivery || '3-5 business days'}</strong></p>
            </div>
          </div>
        `,
      };

    default:
      return null;
  }
}
