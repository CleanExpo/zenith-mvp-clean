#!/usr/bin/env node

/**
 * Stripe Webhook Setup Script
 * 
 * This script helps set up Stripe webhooks for the Zenith platform.
 * It creates the webhook endpoint and provides configuration guidance.
 */

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('🔗 Zenith Stripe Webhook Setup')
  console.log('=' .repeat(50))
  console.log()

  try {
    // Check if Stripe CLI is available
    const { execSync } = require('child_process')
    
    try {
      execSync('stripe --version', { stdio: 'ignore' })
      console.log('✅ Stripe CLI detected')
    } catch (error) {
      console.log('❌ Stripe CLI not found. Please install it from: https://stripe.com/docs/stripe-cli')
      console.log()
    }

    console.log('This script will help you set up Stripe webhooks for Zenith.')
    console.log()

    const setupType = await question('Choose setup type:\n1) Development (using Stripe CLI)\n2) Production (manual setup)\nEnter choice (1 or 2): ')

    if (setupType === '1') {
      await setupDevelopment()
    } else if (setupType === '2') {
      await setupProduction()
    } else {
      console.log('Invalid choice. Exiting.')
    }

  } catch (error) {
    console.error('Error during setup:', error.message)
  } finally {
    rl.close()
  }
}

async function setupDevelopment() {
  console.log()
  console.log('🚀 Development Setup')
  console.log('-'.repeat(30))
  console.log()

  console.log('For development, you can use the Stripe CLI to forward webhooks:')
  console.log()
  console.log('1. Login to Stripe CLI:')
  console.log('   stripe login')
  console.log()
  console.log('2. Forward webhooks to your local server:')
  console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhooks')
  console.log()
  console.log('3. Copy the webhook signing secret (whsec_...) from the CLI output')
  console.log('4. Add it to your .env.local file:')
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_...')
  console.log()
  console.log('5. Start your development server:')
  console.log('   npm run dev')
  console.log()
  console.log('6. Test the webhook by creating a test event:')
  console.log('   stripe trigger customer.subscription.created')
  console.log()
  
  const runNow = await question('Would you like to run the Stripe CLI command now? (y/n): ')
  
  if (runNow.toLowerCase() === 'y') {
    console.log()
    console.log('Starting Stripe CLI webhook forwarding...')
    console.log('Press Ctrl+C to stop')
    console.log()
    
    try {
      execSync('stripe listen --forward-to localhost:3000/api/stripe/webhooks', { stdio: 'inherit' })
    } catch (error) {
      console.log('Stripe CLI forwarding stopped.')
    }
  }
}

async function setupProduction() {
  console.log()
  console.log('🏭 Production Setup')
  console.log('-'.repeat(30))
  console.log()

  const domain = await question('Enter your production domain (e.g., yourdomain.com): ')
  
  if (!domain) {
    console.log('Domain is required for production setup.')
    return
  }

  const webhookUrl = `https://${domain}/api/stripe/webhooks`
  
  console.log()
  console.log('📋 Production Webhook Configuration')
  console.log('=' .repeat(40))
  console.log()
  console.log('1. Go to your Stripe Dashboard:')
  console.log('   https://dashboard.stripe.com/webhooks')
  console.log()
  console.log('2. Click "Add endpoint"')
  console.log()
  console.log('3. Enter the webhook URL:')
  console.log(`   ${webhookUrl}`)
  console.log()
  console.log('4. Select the following events:')
  console.log('   ✅ customer.created')
  console.log('   ✅ customer.updated')
  console.log('   ✅ customer.subscription.created')
  console.log('   ✅ customer.subscription.updated')
  console.log('   ✅ customer.subscription.deleted')
  console.log('   ✅ invoice.payment_succeeded')
  console.log('   ✅ invoice.payment_failed')
  console.log('   ✅ checkout.session.completed')
  console.log()
  console.log('5. After creating the webhook, copy the signing secret')
  console.log()
  console.log('6. Add environment variables to your production environment:')
  console.log('   STRIPE_SECRET_KEY=sk_live_...')
  console.log('   STRIPE_PUBLISHABLE_KEY=pk_live_...')
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_...')
  console.log()
  console.log('7. Deploy your application with the new environment variables')
  console.log()
  console.log('8. Test the webhook by creating a test customer or subscription')
  console.log('   in your Stripe dashboard')
  console.log()

  const showCurl = await question('Would you like to see a curl command to test the webhook? (y/n): ')
  
  if (showCurl.toLowerCase() === 'y') {
    console.log()
    console.log('🧪 Test Webhook with curl:')
    console.log('-'.repeat(25))
    console.log()
    console.log('You can test your webhook endpoint manually:')
    console.log()
    console.log(`curl -X POST ${webhookUrl} \\`)
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -H "Stripe-Signature: t=1234567890,v1=test_signature" \\')
    console.log('  -d \'{"id": "evt_test", "type": "customer.created", "data": {"object": {"id": "cus_test"}}}\'')
    console.log()
    console.log('Note: This will fail signature verification, but you can check if your endpoint is reachable.')
  }
}

// Additional helper functions
function showWebhookEvents() {
  console.log()
  console.log('📊 Webhook Events Reference')
  console.log('-'.repeat(30))
  console.log()
  console.log('Event Types and Their Purposes:')
  console.log()
  console.log('customer.created')
  console.log('  └─ Links new Stripe customers to user accounts')
  console.log()
  console.log('customer.subscription.created')
  console.log('  └─ Activates user subscription, sends welcome email')
  console.log()
  console.log('customer.subscription.updated')
  console.log('  └─ Updates subscription plan, sends change notification')
  console.log()
  console.log('customer.subscription.deleted')
  console.log('  └─ Deactivates subscription, handles cancellation')
  console.log()
  console.log('invoice.payment_succeeded')
  console.log('  └─ Confirms payment, sends receipt email')
  console.log()
  console.log('invoice.payment_failed')
  console.log('  └─ Handles failed payments, sends retry notifications')
  console.log()
  console.log('checkout.session.completed')
  console.log('  └─ Tracks successful checkouts for analytics')
  console.log()
}

// Environment variable template
function showEnvTemplate() {
  console.log()
  console.log('📄 Environment Variables Template')
  console.log('-'.repeat(35))
  console.log()
  console.log('Add these to your .env.local (development) or production environment:')
  console.log()
  console.log('# Stripe Configuration')
  console.log('STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production')
  console.log('STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production')
  console.log('STRIPE_WEBHOOK_SECRET=whsec_...')
  console.log()
  console.log('# Optional: Price IDs for your plans')
  console.log('STRIPE_PRICE_PRO=price_...')
  console.log('STRIPE_PRICE_ENTERPRISE=price_...')
  console.log()
}

// Show webhook monitoring tips
function showMonitoringTips() {
  console.log()
  console.log('📈 Webhook Monitoring Tips')
  console.log('-'.repeat(25))
  console.log()
  console.log('1. Monitor webhook delivery in Stripe Dashboard')
  console.log('2. Use the admin webhook monitor at /admin/webhooks')
  console.log('3. Set up alerts for failed webhook deliveries')
  console.log('4. Implement idempotency to handle duplicate events')
  console.log('5. Log webhook events for debugging and analytics')
  console.log()
}

// Add command line argument handling
if (process.argv.includes('--events')) {
  showWebhookEvents()
  process.exit(0)
}

if (process.argv.includes('--env')) {
  showEnvTemplate()
  process.exit(0)
}

if (process.argv.includes('--monitoring')) {
  showMonitoringTips()
  process.exit(0)
}

if (process.argv.includes('--help')) {
  console.log()
  console.log('🔗 Zenith Stripe Webhook Setup')
  console.log()
  console.log('Usage:')
  console.log('  node setup-stripe-webhooks.js          # Interactive setup')
  console.log('  node setup-stripe-webhooks.js --events # Show webhook events reference')
  console.log('  node setup-stripe-webhooks.js --env    # Show environment variables template')
  console.log('  node setup-stripe-webhooks.js --monitoring # Show monitoring tips')
  console.log('  node setup-stripe-webhooks.js --help   # Show this help')
  console.log()
  process.exit(0)
}

// Run main function
if (require.main === module) {
  main()
}