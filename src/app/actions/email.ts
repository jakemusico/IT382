'use server'

import { OrderStatus } from '@/types'

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: 'Your laundry order has been received and is pending processing.',
  processing: 'Great news! Your laundry is now being washed and processed.',
  ready: 'Your laundry is clean and ready for pickup!',
  out_for_delivery: 'Great news! Your laundry is now out for delivery to your address.',
  completed: 'Your order has been completed. Thank you for choosing us!',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Pending',
  processing: 'Processing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
}

interface EmailParams {
  to: string
  customerName: string
  orderId: string
  status: OrderStatus
}

export async function sendStatusEmail({ to, customerName, orderId, status }: EmailParams) {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    console.warn('BREVO_API_KEY not set — skipping email notification')
    return { success: false, error: 'Email service not configured' }
  }

  const shortId = orderId.slice(0, 8).toUpperCase()
  const statusLabel = STATUS_LABELS[status]
  const message = STATUS_MESSAGES[status]

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; color: #1e293b; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          
          <!-- Header Bar -->
          <div style="height: 4px; background: #2563eb;"></div>
          
          <div style="padding: 40px;">
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 24px; letter-spacing: -0.025em; text-transform: uppercase;">
              LaundryPro <span style="color: #2563eb; font-weight: 400; margin-left: 8px; opacity: 0.5;">|</span> <span style="color: #64748b; font-size: 14px; font-weight: 600; margin-left: 8px;">Order Update</span>
            </h1>
            
            <p style="font-size: 16px; color: #475569; margin-bottom: 32px;">Hello <strong>${customerName}</strong>,</p>

            <!-- Status Card -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; border-left: 4px solid #2563eb; margin-bottom: 32px;">
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Order Details</p>
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 14px; color: #475569;">Order ID:</span>
                <span style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace;">#${shortId}</span>
              </div>
              
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 14px; color: #475569;">New Status:</span>
                <span style="font-size: 16px; font-weight: 800; color: #2563eb;">${statusLabel}</span>
              </div>
            </div>

            <p style="font-size: 15px; color: #334155; line-height: 1.6; font-style: italic; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px dashed #e2e8f0; margin-bottom: 32px;">
              "${message}"
            </p>

            <div style="padding-top: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                Thank you for choosing <strong>LaundryPro</strong>. 
                <br>Our team is working hard to ensure your clothes are perfectly clean.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'onboarding@brevo.com'

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'LaundryPro', email: senderEmail },
        to: [{ email: to, name: customerName }],
        subject: `Order #${shortId} — ${statusLabel}`,
        htmlContent: html,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to send email via Brevo')
    }

    return { success: true }
  } catch (err: any) {
    console.error('Brevo Email Error:', err)
    return { success: false, error: err.message }
  }
}
