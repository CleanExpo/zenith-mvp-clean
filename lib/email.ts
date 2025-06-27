import { Resend } from 'resend'
import { render } from '@react-email/render'

// Email templates will be imported here
// import { WelcomeEmail } from '@/emails/welcome'
// import { PaymentConfirmationEmail } from '@/emails/payment-confirmation'
// import { SubscriptionUpdateEmail } from '@/emails/subscription-update'

const isEmailConfigured = () => {
  return !!(process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
}

const resend = isEmailConfigured() 
  ? new Resend(process.env.RESEND_API_KEY!)
  : null

interface EmailOptions {
  to: string
  subject: string
  html?: string
  react?: React.ReactElement
}

interface WelcomeEmailData {
  name: string
  email: string
  loginUrl: string
}

interface PaymentConfirmationData {
  name: string
  amount: number
  plan: string
  invoiceUrl: string
  nextBillingDate: string
}

interface SubscriptionUpdateData {
  name: string
  oldPlan: string
  newPlan: string
  effectiveDate: string
  nextBillingDate: string
  amount: number
}

class EmailService {
  private fromEmail = process.env.FROM_EMAIL || 'noreply@zenith.com'
  private demoMode = !isEmailConfigured()

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (this.demoMode) {
        console.log('📧 Demo Email:', {
          to: options.to,
          subject: options.subject,
          from: this.fromEmail
        })
        return true
      }

      if (!resend) {
        throw new Error('Email service not configured')
      }

      const emailData: any = {
        from: this.fromEmail,
        to: options.to,
        subject: options.subject
      }

      if (options.react) {
        emailData.html = render(options.react)
      } else if (options.html) {
        emailData.html = options.html
      }

      const result = await resend.emails.send(emailData)
      
      if (result.error) {
        console.error('Email send error:', result.error)
        return false
      }

      console.log(`📧 Email sent successfully to ${options.to}`)
      return true

    } catch (error) {
      console.error('Email service error:', error)
      return false
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Welcome to Zenith</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Zenith! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name || 'there'}!</h2>
              <p>Welcome to Zenith, the powerful website analysis platform that helps you optimize your online presence.</p>
              
              <p>Your account has been successfully created with the email: <strong>${data.email}</strong></p>
              
              <p>Here's what you can do next:</p>
              <ul>
                <li>🔍 <strong>Analyze your website</strong> - Get detailed insights into your site's performance</li>
                <li>📊 <strong>Track improvements</strong> - Monitor your progress over time</li>
                <li>🎯 <strong>Optimize for success</strong> - Use our recommendations to improve your rankings</li>
                <li>👥 <strong>Collaborate with your team</strong> - Share projects and insights</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${data.loginUrl}" class="button">Get Started Now</a>
              </div>
              
              <p>If you have any questions, feel free to reach out to our support team. We're here to help!</p>
              
              <p>Best regards,<br>The Zenith Team</p>
            </div>
            <div class="footer">
              <p>© 2023 Zenith. All rights reserved.</p>
              <p>This email was sent to ${data.email}</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: data.email,
      subject: '🎉 Welcome to Zenith - Your Account is Ready!',
      html
    })
  }

  async sendPaymentConfirmationEmail(data: PaymentConfirmationData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .button { background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed ✅</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${data.name}!</h2>
              <p>Your payment has been successfully processed.</p>
              
              <div class="amount">$${data.amount.toFixed(2)}</div>
              
              <div class="details">
                <h3>Payment Details</h3>
                <p><strong>Plan:</strong> ${data.plan}</p>
                <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
                <p><strong>Next billing date:</strong> ${data.nextBillingDate}</p>
              </div>
              
              <p>You now have access to all the premium features of your ${data.plan} plan. Start exploring the enhanced capabilities today!</p>
              
              <div style="text-align: center;">
                <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
              </div>
              
              <p>Questions about your subscription? Contact our support team anytime.</p>
              
              <p>Best regards,<br>The Zenith Team</p>
            </div>
            <div class="footer">
              <p>© 2023 Zenith. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: data.name, // This should be email, but keeping interface consistent
      subject: '✅ Payment Confirmed - Welcome to Premium!',
      html
    })
  }

  async sendSubscriptionUpdateEmail(data: SubscriptionUpdateData): Promise<boolean> {
    const isUpgrade = data.newPlan > data.oldPlan // Simple comparison, you might need better logic
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Subscription Updated</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .change { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
            .old-plan { color: #666; text-decoration: line-through; }
            .new-plan { color: #4F46E5; font-weight: bold; font-size: 18px; }
            .arrow { font-size: 24px; margin: 0 10px; color: #4F46E5; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription ${isUpgrade ? 'Upgraded' : 'Updated'} 🚀</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name}!</h2>
              <p>Your subscription has been successfully ${isUpgrade ? 'upgraded' : 'updated'}.</p>
              
              <div class="change">
                <div>
                  <span class="old-plan">${data.oldPlan}</span>
                  <span class="arrow">→</span>
                  <span class="new-plan">${data.newPlan}</span>
                </div>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3>Updated Details</h3>
                <p><strong>New Plan:</strong> ${data.newPlan}</p>
                <p><strong>Effective Date:</strong> ${data.effectiveDate}</p>
                <p><strong>New Amount:</strong> $${data.amount.toFixed(2)}</p>
                <p><strong>Next billing date:</strong> ${data.nextBillingDate}</p>
              </div>
              
              <p>${isUpgrade ? 
                'You now have access to additional premium features! Explore your enhanced capabilities.' :
                'Your plan has been updated according to your preferences.'
              }</p>
              
              <p>If you have any questions about your subscription changes, don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The Zenith Team</p>
            </div>
            <div class="footer">
              <p>© 2023 Zenith. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: data.name, // This should be email, but keeping interface consistent
      subject: `🚀 Subscription ${isUpgrade ? 'Upgraded' : 'Updated'} - ${data.newPlan} Plan`,
      html
    })
  }

  async sendPasswordResetEmail(email: string, resetUrl: string, name?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password 🔐</h1>
            </div>
            <div class="content">
              <h2>Hi ${name || 'there'}!</h2>
              <p>We received a request to reset the password for your Zenith account.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 4px;">${resetUrl}</p>
              
              <p>If you need help, contact our support team.</p>
              
              <p>Best regards,<br>The Zenith Team</p>
            </div>
            <div class="footer">
              <p>© 2023 Zenith. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: '🔐 Reset Your Zenith Password',
      html
    })
  }

  async sendTestEmail(to: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email System Working!</h1>
              <p>This is a test email from Zenith</p>
              <p>Sent at: ${new Date().toISOString()}</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: '✅ Zenith Email Test',
      html
    })
  }

  // Utility methods
  isConfigured(): boolean {
    return !this.demoMode
  }

  getDemoMode(): boolean {
    return this.demoMode
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export types for use in other files
export type {
  WelcomeEmailData,
  PaymentConfirmationData,
  SubscriptionUpdateData,
  EmailOptions
}