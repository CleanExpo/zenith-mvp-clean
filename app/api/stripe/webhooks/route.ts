export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured() || !stripe || !webhookSecret) {
      console.log('Stripe webhook received but Stripe not configured')
      return NextResponse.json({ received: true })
    }

    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log(`Received Stripe webhook: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Handling subscription created:', subscription.id)

    const customerId = subscription.customer as string
    const customer = await stripe?.customers.retrieve(customerId) as Stripe.Customer

    if (!customer || !customer.email) {
      console.error('Customer not found or has no email')
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      console.error('User not found for email:', customer.email)
      return
    }

    // Get price information
    const priceId = subscription.items.data[0]?.price.id
    const planName = getPlanNameFromPriceId(priceId)

    // Update user subscription in database
    // Note: You'll need to add subscription fields to your User model
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // stripeCustomerId: customerId,
        // stripeSubscriptionId: subscription.id,
        // subscriptionStatus: subscription.status,
        // subscriptionPlan: planName,
        // currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    })

    // Send welcome email
    await emailService.sendWelcomeEmail({
      name: user.name || customer.name || 'Valued Customer',
      email: user.email,
      loginUrl: `${process.env.NEXTAUTH_URL}/dashboard`
    })

    console.log('Subscription created successfully processed')

  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Handling subscription updated:', subscription.id)

    const customerId = subscription.customer as string
    const customer = await stripe?.customers.retrieve(customerId) as Stripe.Customer

    if (!customer || !customer.email) {
      console.error('Customer not found or has no email')
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      console.error('User not found for email:', customer.email)
      return
    }

    // Get price information
    const priceId = subscription.items.data[0]?.price.id
    const planName = getPlanNameFromPriceId(priceId)

    // Update subscription in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // subscriptionStatus: subscription.status,
        // subscriptionPlan: planName,
        // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        // cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })

    // Send subscription update email if plan changed
    const amount = subscription.items.data[0]?.price.unit_amount || 0
    await emailService.sendSubscriptionUpdateEmail({
      name: user.name || customer.name || 'Valued Customer',
      oldPlan: 'Previous Plan', // You'd track this in your database
      newPlan: planName,
      effectiveDate: new Date().toLocaleDateString(),
      nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
      amount: amount / 100
    })

    console.log('Subscription updated successfully processed')

  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    console.log('Handling subscription canceled:', subscription.id)

    const customerId = subscription.customer as string
    const customer = await stripe?.customers.retrieve(customerId) as Stripe.Customer

    if (!customer || !customer.email) {
      console.error('Customer not found or has no email')
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      console.error('User not found for email:', customer.email)
      return
    }

    // Update subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // subscriptionStatus: 'canceled',
        // cancelAtPeriodEnd: true
      }
    })

    // Send cancellation confirmation email
    // You might want to create a dedicated template for this

    console.log('Subscription canceled successfully processed')

  } catch (error) {
    console.error('Error handling subscription canceled:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Handling payment succeeded:', invoice.id)

    const customerId = invoice.customer as string
    const customer = await stripe?.customers.retrieve(customerId) as Stripe.Customer

    if (!customer || !customer.email) {
      console.error('Customer not found or has no email')
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      console.error('User not found for email:', customer.email)
      return
    }

    // Send payment confirmation email
    await emailService.sendPaymentConfirmationEmail({
      name: user.name || customer.name || 'Valued Customer',
      amount: (invoice.amount_paid || 0) / 100,
      plan: getPlanNameFromPriceId(invoice.lines.data[0]?.price?.id),
      invoiceUrl: invoice.hosted_invoice_url || '#',
      nextBillingDate: invoice.period_end ? 
        new Date(invoice.period_end * 1000).toLocaleDateString() : 
        'N/A'
    })

    console.log('Payment succeeded successfully processed')

  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Handling payment failed:', invoice.id)

    const customerId = invoice.customer as string
    const customer = await stripe?.customers.retrieve(customerId) as Stripe.Customer

    if (!customer || !customer.email) {
      console.error('Customer not found or has no email')
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      console.error('User not found for email:', customer.email)
      return
    }

    // Update subscription status if needed
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // subscriptionStatus: 'past_due'
      }
    })

    // Send payment failed notification
    // You might want to create a dedicated template for this

    console.log('Payment failed successfully processed')

  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    console.log('Handling customer created:', customer.id)

    if (!customer.email) {
      console.error('Customer has no email')
      return
    }

    // Find user by email and update with Stripe customer ID
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
    }

    console.log('Customer created successfully processed')

  } catch (error) {
    console.error('Error handling customer created:', error)
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  try {
    console.log('Handling customer updated:', customer.id)

    if (!customer.email) {
      console.error('Customer has no email')
      return
    }

    // Update user information if needed
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (user && customer.name && customer.name !== user.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: customer.name
        }
      })
    }

    console.log('Customer updated successfully processed')

  } catch (error) {
    console.error('Error handling customer updated:', error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Handling checkout completed:', session.id)

    if (!session.customer_email) {
      console.error('Checkout session has no customer email')
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.customer_email }
    })

    if (!user) {
      console.error('User not found for email:', session.customer_email)
      return
    }

    // The subscription created webhook will handle the main logic
    // This is just for additional tracking if needed

    console.log('Checkout completed successfully processed')

  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

function getPlanNameFromPriceId(priceId?: string): string {
  // Map your Stripe price IDs to plan names
  // You'd typically store this mapping in your database or environment variables
  const priceMapping: { [key: string]: string } = {
    'price_1234567890': 'Pro',
    'price_0987654321': 'Enterprise',
    // Add your actual price IDs here
  }

  return priceMapping[priceId || ''] || 'Unknown Plan'
}