#!/usr/bin/env node

/**
 * Production Deployment Script
 * 
 * This script handles the complete production deployment process including:
 * - Environment validation
 * - Pre-deployment checks
 * - Database migrations
 * - Build verification
 * - Post-deployment validation
 * - Rollback procedures
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const config = {
  environments: ['production', 'staging'],
  requiredEnvVars: [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'REDIS_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ],
  healthCheckEndpoints: [
    '/api/health',
    '/api/auth/session',
    '/api/website-analyzer/scan'
  ],
  maxWaitTime: 300000, // 5 minutes
  rollbackTimeout: 120000 // 2 minutes
};

class ProductionDeployment {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.deploymentId = `deploy-${Date.now()}`;
    this.startTime = Date.now();
    this.logFile = path.join(__dirname, '..', 'logs', `deployment-${this.deploymentId}.log`);
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async validateEnvironment(environment) {
    this.log(`Validating ${environment} environment...`);
    
    // Check if environment file exists
    const envFile = environment === 'production' ? '.env.production' : '.env.staging';
    const envPath = path.join(__dirname, '..', envFile);
    
    if (!fs.existsSync(envPath)) {
      throw new Error(`Environment file ${envFile} not found`);
    }

    // Load environment variables
    require('dotenv').config({ path: envPath });

    // Validate required environment variables
    const missing = [];
    for (const envVar of config.requiredEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    this.log(`Environment validation passed for ${environment}`);
    return true;
  }

  async runPreDeploymentChecks() {
    this.log('Running pre-deployment checks...');
    
    try {
      // Run TypeScript compilation
      this.log('Checking TypeScript compilation...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // Run tests
      this.log('Running test suite...');
      execSync('npm run test', { stdio: 'inherit' });
      
      // Run linting
      this.log('Running linting checks...');
      execSync('npm run lint', { stdio: 'inherit' });
      
      // Security audit
      this.log('Running security audit...');
      execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
      
      // Database connectivity check
      this.log('Checking database connectivity...');
      execSync('node scripts/health-check.js', { stdio: 'inherit' });
      
      this.log('All pre-deployment checks passed');
      return true;
    } catch (error) {
      this.log(`Pre-deployment check failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async runDatabaseMigrations() {
    this.log('Running database migrations...');
    
    try {
      // Generate Prisma client
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Run migrations
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      
      // Verify database schema
      execSync('npx prisma db pull', { stdio: 'inherit' });
      
      this.log('Database migrations completed successfully');
      return true;
    } catch (error) {
      this.log(`Database migration failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async buildApplication() {
    this.log('Building application for production...');
    
    try {
      // Clean previous build
      if (fs.existsSync('.next')) {
        execSync('rm -rf .next', { stdio: 'inherit' });
      }
      
      // Build application
      execSync('npm run build', { stdio: 'inherit' });
      
      // Verify build output
      if (!fs.existsSync('.next')) {
        throw new Error('Build output directory not found');
      }
      
      this.log('Application build completed successfully');
      return true;
    } catch (error) {
      this.log(`Application build failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async deployToVercel(environment) {
    this.log(`Deploying to Vercel (${environment})...`);
    
    try {
      const deployCommand = environment === 'production' 
        ? 'npx vercel --prod --yes'
        : 'npx vercel --yes';
      
      const output = execSync(deployCommand, { encoding: 'utf8' });
      const deploymentUrl = output.trim().split('\n').pop();
      
      this.log(`Deployment completed: ${deploymentUrl}`);
      return deploymentUrl;
    } catch (error) {
      this.log(`Vercel deployment failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async validateDeployment(deploymentUrl) {
    this.log('Validating deployment...');
    
    const maxRetries = 10;
    const retryDelay = 30000; // 30 seconds
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        for (const endpoint of config.healthCheckEndpoints) {
          const url = `${deploymentUrl}${endpoint}`;
          this.log(`Checking health endpoint: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'Deployment-Validator' }
          });
          
          if (!response.ok) {
            throw new Error(`Health check failed for ${endpoint}: ${response.status}`);
          }
        }
        
        this.log('All health checks passed');
        return true;
      } catch (error) {
        this.log(`Health check attempt ${i + 1}/${maxRetries} failed: ${error.message}`, 'WARN');
        
        if (i < maxRetries - 1) {
          this.log(`Retrying in ${retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          throw new Error(`Deployment validation failed after ${maxRetries} attempts`);
        }
      }
    }
  }

  async createBackup() {
    this.log('Creating pre-deployment backup...');
    
    try {
      const backupScript = path.join(__dirname, 'backup-database.sh');
      if (fs.existsSync(backupScript)) {
        execSync(`bash ${backupScript}`, { stdio: 'inherit' });
        this.log('Database backup created successfully');
      } else {
        this.log('Backup script not found, skipping backup', 'WARN');
      }
      
      return true;
    } catch (error) {
      this.log(`Backup creation failed: ${error.message}`, 'ERROR');
      // Don't fail deployment for backup issues
      return false;
    }
  }

  async rollback(previousDeploymentUrl) {
    this.log('Initiating rollback procedure...');
    
    try {
      if (previousDeploymentUrl) {
        // Rollback to previous deployment
        execSync(`npx vercel rollback ${previousDeploymentUrl}`, { stdio: 'inherit' });
        this.log('Rollback completed successfully');
      } else {
        this.log('No previous deployment URL available for rollback', 'WARN');
      }
      
      return true;
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async cleanup() {
    this.rl.close();
    
    const duration = Date.now() - this.startTime;
    this.log(`Deployment process completed in ${duration / 1000} seconds`);
    this.log(`Full deployment log saved to: ${this.logFile}`);
  }

  async run() {
    try {
      console.log('🚀 Zenith Platform - Production Deployment');
      console.log('==========================================\n');
      
      // Confirm deployment
      const environment = await this.question('Deploy to (production/staging): ');
      if (!config.environments.includes(environment)) {
        throw new Error('Invalid environment. Use "production" or "staging"');
      }
      
      const confirm = await this.question(`Are you sure you want to deploy to ${environment}? (yes/no): `);
      if (confirm.toLowerCase() !== 'yes') {
        console.log('Deployment cancelled by user');
        return;
      }
      
      this.log(`Starting deployment to ${environment}`);
      
      // Pre-deployment steps
      await this.validateEnvironment(environment);
      await this.runPreDeploymentChecks();
      await this.createBackup();
      await this.runDatabaseMigrations();
      await this.buildApplication();
      
      // Deployment
      const deploymentUrl = await this.deployToVercel(environment);
      
      // Post-deployment validation
      await this.validateDeployment(deploymentUrl);
      
      // Success
      console.log('\n✅ Deployment completed successfully!');
      console.log(`🌐 Deployment URL: ${deploymentUrl}`);
      console.log(`📊 Monitor at: ${deploymentUrl}/admin/monitoring`);
      
    } catch (error) {
      console.log('\n❌ Deployment failed!');
      console.log(`Error: ${error.message}`);
      
      const rollback = await this.question('Would you like to rollback? (yes/no): ');
      if (rollback.toLowerCase() === 'yes') {
        await this.rollback();
      }
      
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployment = new ProductionDeployment();
  deployment.run().catch(console.error);
}

module.exports = ProductionDeployment;