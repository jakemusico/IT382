'use server'

import { OrderStatus } from '@/types'

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: 'Your laundry order has been received and is pending processing.',
  processing: 'Great news! Your laundry is now being washed and processed.',
  ready: 'Your laundry is clean and ready for pickup or delivery!',
  completed: 'Your order has been completed. Thank you for choosing us!',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '⏳ Order Pending',
  processing: '🧺 Processing',
  ready: '✅ Ready',
  completed: '🎉 Completed',
}

interface EmailParams {
  to: string
  customerName: string
  orderId: string
  status: OrderStatus
}

export async function sendStatusEmail({ to, customerName, orderId, status }: EmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email notification')
    return { success: false, error: 'Email service not configured' }
  }

  const shortId = orderId.slice(0, 8).toUpperCase()
  const statusLabel = STATUS_LABELS[status]
  const message = STATUS_MESSAGES[status]

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 40px 32px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">🧺</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">LaundryPro</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Laundry Management System</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px;">
            <p style="color: #374151; margin: 0 0 8px; font-size: 16px;">Hi <strong>${customerName}</strong>,</p>
            <p style="color: #6b7280; margin: 0 0 32px; font-size: 15px;">Your order status has been updated.</p>

            <!-- Status Badge -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: #6b7280; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Current Status</p>
              <p style="color: #1d4ed8; margin: 0; font-size: 24px; font-weight: 700;">${statusLabel}</p>
            </div>

            <!-- Order Info -->
            <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 14px;">Order ID</span>
                <span style="color: #111827; font-size: 14px; font-weight: 600; font-family: monospace;">#${shortId}</span>
              </div>
            </div>

            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">${message}</p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="display: block; background: #3b82f6; color: #ffffff; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 600;">
              View Order Details
            </a>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px; background: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © 2025 LaundryPro. If you have any questions, please contact us.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LaundryPro <noreply@laundrypro.com>',
        to: [to],
        subject: `Order #${shortId} — ${statusLabel}`,
        html,
      }),
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error('Email send error:', errData)
      return { success: false, error: errData.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Email send exception:', err)
    return { success: false, error: 'Network error' }
  }
}
