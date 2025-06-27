import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

/**
 * Webhook Event Handlers for Stripe Integration
 * 
 * These handlers process Stripe webhook events and sync data with our database.
 * Each handler is responsible for a specific event type and maintains data consistency.
 */

export interface WebhookContext {
  event: Stripe.Event
  stripe: Stripe
}

export class WebhookHandlers {
  
  /**
   * Handle subscription creation
   * - Update user subscription status
   * - Send welcome email
   * - Track subscription metrics
   */
  static async handleSubscriptionCreated(subscription: Stripe.Subscription, context: WebhookContext) {
    try {
      console.log(`Processing subscription.created: ${subscription.id}`)

      const customer = await context.stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
      
      if (!customer.email) {
        throw new Error('Customer email not found')
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      })

      if (!user) {
        console.warn(`User not found for email: ${customer.email}`)
        return
      }

      // Extract subscription details
      const priceId = subscription.items.data[0]?.price.id
      const planName = WebhookHandlers.getPlanFromPriceId(priceId)
      const amount = subscription.items.data[0]?.price.unit_amount || 0

      // Update user in database (you'll need to add these fields to your User model)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // Add these fields to your Prisma schema:
          // stripeCustomerId: customer.id,
          // stripeSubscriptionId: subscription.id,
          // subscriptionStatus: subscription.status,
          // subscriptionPlan: planName,
          // currentPeriodStart: new Date(subscription.current_period_start * 1000),
          // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          // cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      })

      // Send welcome email for new subscribers
      await emailService.sendWelcomeEmail({
        name: user.name || customer.name || 'Valued Customer',
        email: user.email,
        loginUrl: `${process.env.NEXTAUTH_URL}/dashboard`
      })

      // Track subscription creation (for analytics)
      await WebhookHandlers.trackEvent('subscription_created', {
        userId: user.id,
        subscriptionId: subscription.id,
        plan: planName,
        amount: amount / 100
      })

      console.log(`Subscription created successfully for user: ${user.email}`)

    } catch (error) {
      console.error('Error handling subscription created:', error)
      throw error
    }
  }

  /**
   * Handle subscription updates
   * - Update subscription details
   * - Send plan change notifications
   * - Track plan changes
   */
  static async handleSubscriptionUpdated(subscription: Stripe.Subscription, context: WebhookContext) {
    try {
      console.log(`Processing subscription.updated: ${subscription.id}`)

      const customer = await context.stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
      
      if (!customer.email) {
        throw new Error('Customer email not found')
      }

      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      })

      if (!user) {
        console.warn(`User not found for email: ${customer.email}`)
        return
      }

      // Get current subscription details from database
      // You'd typically have a separate subscriptions table for this
      const currentSubscription = null // await prisma.subscription.findUnique(...)

      // Extract new subscription details
      const priceId = subscription.items.data[0]?.price.id
      const newPlan = WebhookHandlers.getPlanFromPriceId(priceId)
      const amount = subscription.items.data[0]?.price.unit_amount || 0

      // Update subscription in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // subscriptionStatus: subscription.status,
          // subscriptionPlan: newPlan,
          // currentPeriodStart: new Date(subscription.current_period_start * 1000),
          // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          // cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      })

      // Send plan change notification if plan actually changed
      if (newPlan !== (currentSubscription as any)?.plan) {
        await emailService.sendSubscriptionUpdateEmail({
          name: user.name || customer.name || 'Valued Customer',
          oldPlan: (currentSubscription as any)?.plan || 'Previous Plan',
          newPlan: newPlan,
          effectiveDate: new Date().toLocaleDateString(),
          nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
          amount: amount / 100
        })

        // Track plan change
        await WebhookHandlers.trackEvent('plan_changed', {
          userId: user.id,
          subscriptionId: subscription.id,
          oldPlan: (currentSubscription as any)?.plan,
          newPlan: newPlan,
          amount: amount / 100
        })
      }

      console.log(`Subscription updated successfully for user: ${user.email}`)

    } catch (error) {
      console.error('Error handling subscription updated:', error)
      throw error
    }
  }

  /**
   * Handle subscription cancellation
   * - Update cancellation status
   * - Send cancellation confirmation
   * - Track churn metrics
   */
  static async handleSubscriptionDeleted(subscription: Stripe.Subscription, context: WebhookContext) {
    try {
      console.log(`Processing subscription.deleted: ${subscription.id}`)

      const customer = await context.stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
      
      if (!customer.email) {
        throw new Error('Customer email not found')
      }

      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      })

      if (!user) {
        console.warn(`User not found for email: ${customer.email}`)
        return
      }

      // Update subscription status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // subscriptionStatus: 'canceled',
          // subscriptionPlan: 'free',
          // canceledAt: new Date()
        }
      })

      // Track cancellation for analytics
      await WebhookHandlers.trackEvent('subscription_canceled', {
        userId: user.id,
        subscriptionId: subscription.id,
        canceledAt: new Date(),
        reason: 'stripe_webhook'
      })

      console.log(`Subscription canceled successfully for user: ${user.email}`)

    } catch (error) {
      console.error('Error handling subscription deleted:', error)
      throw error
    }
  }

  /**
   * Handle successful payments
   * - Send payment confirmations
   * - Update payment history
   * - Track revenue metrics
   */
  static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, context: WebhookContext) {
    try {
      console.log(`Processing invoice.payment_succeeded: ${invoice.id}`)

      const customer = await context.stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer
      
      if (!customer.email) {
        throw new Error('Customer email not found')
      }

      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      })

      if (!user) {
        console.warn(`User not found for email: ${customer.email}`)
        return
      }

      // Send payment confirmation email
      const planName = WebhookHandlers.getPlanFromPriceId(invoice.lines.data[0]?.price?.id)
      
      await emailService.sendPaymentConfirmationEmail({
        name: user.name || customer.name || 'Valued Customer',
        amount: (invoice.amount_paid || 0) / 100,
        plan: planName,
        invoiceUrl: invoice.hosted_invoice_url || `${process.env.NEXTAUTH_URL}/billing`,
        nextBillingDate: invoice.period_end ? 
          new Date(invoice.period_end * 1000).toLocaleDateString() : 
          'N/A'
      })

      // Track successful payment
      await WebhookHandlers.trackEvent('payment_succeeded', {
        userId: user.id,
        invoiceId: invoice.id,
        amount: (invoice.amount_paid || 0) / 100,
        plan: planName
      })

      console.log(`Payment succeeded processed for user: ${user.email}`)

    } catch (error) {
      console.error('Error handling payment succeeded:', error)
      throw error
    }
  }

  /**
   * Handle failed payments
   * - Update payment status
   * - Send failure notifications
   * - Track failed payment metrics
   */
  static async handleInvoicePaymentFailed(invoice: Stripe.Invoice, context: WebhookContext) {
    try {
      console.log(`Processing invoice.payment_failed: ${invoice.id}`)

      const customer = await context.stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer
      
      if (!customer.email) {
        throw new Error('Customer email not found')
      }

      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      })

      if (!user) {
        console.warn(`User not found for email: ${customer.email}`)
        return
      }

      // Update subscription status to past_due if needed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // subscriptionStatus: 'past_due'
        }
      })

      // Send payment failure notification
      // You might want to create a dedicated email template for this

      // Track failed payment
      await WebhookHandlers.trackEvent('payment_failed', {
        userId: user.id,
        invoiceId: invoice.id,
        amount: (invoice.amount_due || 0) / 100,
        attemptCount: invoice.attempt_count
      })

      console.log(`Payment failed processed for user: ${user.email}`)

    } catch (error) {
      console.error('Error handling payment failed:', error)
      throw error
    }
  }

  /**
   * Handle customer creation
   * - Link Stripe customer to user
   * - Initialize customer data
   */
  static async handleCustomerCreated(customer: Stripe.Customer, context: WebhookContext) {
    try {
      console.log(`Processing customer.created: ${customer.id}`)

      if (!customer.email) {
        console.warn('Customer created without email')
        return
      }

      const user = await prisma.user.findUnique({
        where: { email: customer.email }
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            // stripeCustomerId: customer.id
          }
        })

        console.log(`Customer linked to user: ${user.email}`)
      }

    } catch (error) {
      console.error('Error handling customer created:', error)
      throw error
    }
  }

  /**
   * Map Stripe price IDs to plan names
   */
  static getPlanFromPriceId(priceId?: string): string {
    if (!priceId) return 'Unknown'

    // You should store this mapping in environment variables or database
    const priceToplanMapping: { [key: string]: string } = {
      [process.env.STRIPE_PRICE_PRO || '']: 'Pro',
      [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'Enterprise',
      // Add more mappings as needed
    }

    return priceToplanMapping[priceId] || 'Unknown'
  }

  /**
   * Track events for analytics
   */
  static async trackEvent(eventType: string, data: any) {
    try {
      // In a real app, you might send this to an analytics service
      // or store in a dedicated events table
      console.log(`Tracking event: ${eventType}`, data)

      // Example: Store in database
      // await prisma.analyticsEvent.create({
      //   data: {
      //     type: eventType,
      //     userId: data.userId,
      //     metadata: data,
      //     timestamp: new Date()
      //   }
      // })

    } catch (error) {
      console.error('Error tracking event:', error)
      // Don't throw here - analytics failures shouldn't break webhook processing
    }
  }

  /**
   * Validate webhook payload
   */
  static validateWebhookPayload(event: Stripe.Event): boolean {
    try {
      // Add any custom validation logic here
      if (!event.id || !event.type || !event.data) {
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating webhook payload:', error)
      return false
    }
  }

  /**
   * Handle webhook errors and retries
   */
  static async handleWebhookError(error: Error, event: Stripe.Event) {
    console.error(`Webhook error for event ${event.id}:`, error)

    // In a production app, you might:
    // 1. Store failed webhooks for manual review
    // 2. Send alerts to monitoring systems
    // 3. Implement retry logic with exponential backoff

    try {
      // Example: Store failed webhook for review
      // await prisma.failedWebhook.create({
      //   data: {
      //     eventId: event.id,
      //     eventType: event.type,
      //     error: error.message,
      //     payload: JSON.stringify(event),
      //     timestamp: new Date()
      //   }
      // })
    } catch (dbError) {
      console.error('Error storing failed webhook:', dbError)
    }
  }
}