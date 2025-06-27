# Zenith Platform - Production Deployment Guide

This comprehensive guide covers the complete production deployment process for the Zenith Platform enterprise SaaS application.

## 🚀 Quick Start

For experienced teams, use the automated deployment script:

```bash
# Run automated production deployment
node scripts/production-deployment.js

# Or for staging deployment
node scripts/production-deployment.js
```

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup

1. **Vercel Account Setup**
   - Ensure you have admin access to the Vercel project
   - Verify domain configuration (zenith.engineer)
   - Check deployment settings and build configuration

2. **Database Configuration**
   - Production PostgreSQL database provisioned
   - Connection string secured and tested
   - Database migrations ready for deployment
   - Backup procedures in place

3. **External Services**
   - Redis instance configured for production
   - Stripe account in live mode with API keys
   - Google OAuth credentials for production domain
   - Email service (SendGrid, etc.) configured

4. **Monitoring & Analytics**
   - Sentry account configured for error tracking
   - Google Analytics tracking ID set up
   - Uptime monitoring service configured

### ✅ Code Quality Verification

```bash
# Run complete verification suite
npm run build          # TypeScript compilation
npm run test           # Test suite (45+ tests)
npm run lint           # ESLint checks
npm audit              # Security vulnerabilities
```

## 🔧 Environment Variables Configuration

### Required Production Environment Variables

Create these in your Vercel dashboard under Environment Variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
NEXTAUTH_URL="https://zenith.engineer"
NEXTAUTH_SECRET="your-secure-random-secret-32-chars"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Redis Cache
REDIS_URL="redis://user:password@host:port"

# Payment Processing
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Monitoring & Analytics
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Email Service
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
FROM_EMAIL="noreply@zenith.engineer"

# Feature Flags & Configuration
FEATURE_FLAGS_ENABLED="true"
ADMIN_EMAILS="admin@zenith.engineer,support@zenith.engineer"

# Security
ENCRYPTION_KEY="your-32-char-encryption-key"
JWT_SECRET="your-jwt-secret-key"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"
```

### Environment Variable Security

- Use Vercel's encrypted environment variables
- Never commit secrets to version control
- Rotate keys regularly (quarterly recommended)
- Use different keys for staging vs production
- Implement key rotation procedures

## 🗄️ Database Setup & Migration

### Production Database Configuration

```bash
# 1. Ensure database is provisioned with SSL
# 2. Generate Prisma client for production
npx prisma generate

# 3. Run database migrations
npx prisma migrate deploy

# 4. Seed initial data (optional)
node scripts/seed-production-data.js

# 5. Create performance indexes
node scripts/apply-performance-indexes.js

# 6. Verify database health
node scripts/health-check.js
```

### Database Security Best Practices

- Enable SSL/TLS connections
- Use connection pooling
- Implement regular backups
- Set up monitoring and alerting
- Configure read replicas for scaling

## 🔐 Security Configuration

### SSL/TLS Setup

- Domain SSL certificate (automatically handled by Vercel)
- Force HTTPS redirects
- HSTS headers configured
- Secure cookie settings

### Security Headers

```typescript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### Rate Limiting & DDoS Protection

- Configured for 100 requests per 15-minute window
- IP-based rate limiting
- Cloudflare integration recommended
- Automatic threat detection

## 📊 Monitoring & Observability

### Health Endpoints

The platform includes comprehensive health monitoring:

```bash
# System health
GET /api/health

# Database connectivity
GET /api/health/database

# Redis connectivity
GET /api/health/redis

# External services
GET /api/health/services
```

### Error Tracking

- Sentry integration for real-time error tracking
- Custom error boundaries in React components
- API error logging with stack traces
- User session replay for debugging

### Performance Monitoring

- Real-time performance metrics
- Database query optimization
- CDN and caching strategies
- Auto-scaling based on load

## 🚀 Deployment Procedures

### Automated Deployment (Recommended)

```bash
# 1. Run the automated deployment script
node scripts/production-deployment.js

# 2. Select environment (production/staging)
# 3. Confirm deployment
# 4. Monitor progress and health checks
```

### Manual Deployment Steps

```bash
# 1. Pre-deployment verification
npm run build
npm run test
npm run lint

# 2. Database migrations
npx prisma migrate deploy

# 3. Deploy to Vercel
npx vercel --prod

# 4. Verify deployment
curl https://zenith.engineer/api/health

# 5. Monitor logs and metrics
vercel logs --follow
```

### Deployment Verification Checklist

- [ ] Application loads successfully
- [ ] Authentication flow works
- [ ] Database connections active
- [ ] External API integrations functional
- [ ] Payment processing operational
- [ ] Email notifications working
- [ ] Error tracking active
- [ ] Performance metrics available

## 🔄 Post-Deployment Procedures

### Immediate Post-Deployment (0-15 minutes)

1. **Health Check Verification**
   ```bash
   # Verify all health endpoints
   curl https://zenith.engineer/api/health
   curl https://zenith.engineer/api/health/database
   curl https://zenith.engineer/api/health/redis
   ```

2. **Critical User Flows**
   - User registration and login
   - Website analyzer functionality
   - Team creation and management
   - Payment processing (if applicable)

3. **Performance Monitoring**
   - Response time checks
   - Error rate monitoring
   - Database query performance
   - Memory and CPU usage

### Extended Monitoring (15 minutes - 24 hours)

1. **User Experience Monitoring**
   - Real user monitoring (RUM)
   - Page load times
   - User engagement metrics
   - Conversion funnel analysis

2. **System Stability**
   - Error rate trends
   - Performance degradation alerts
   - Resource utilization patterns
   - Third-party service availability

3. **Business Metrics**
   - User registration rates
   - Feature adoption
   - Revenue tracking
   - Support ticket volume

## 🆘 Rollback Procedures

### Automated Rollback

```bash
# Using the deployment script
node scripts/production-deployment.js
# Select rollback option when prompted

# Or manual Vercel rollback
npx vercel rollback [deployment-url]
```

### Emergency Rollback Steps

1. **Immediate Actions (< 2 minutes)**
   ```bash
   # Rollback to previous deployment
   npx vercel rollback
   
   # Verify rollback success
   curl https://zenith.engineer/api/health
   ```

2. **Database Rollback (if needed)**
   ```bash
   # Restore from backup
   bash scripts/restore-from-backup.sh [backup-file]
   
   # Verify data integrity
   node scripts/verify-database.js
   ```

3. **Communication Protocol**
   - Notify stakeholders immediately
   - Update status page
   - Prepare incident report
   - Schedule post-mortem review

### Rollback Decision Criteria

Initiate rollback if:
- Error rate > 1% for 5+ minutes
- Response time > 2 seconds for 10+ minutes
- Critical functionality unavailable
- Database corruption detected
- Security vulnerability exposed

## 📈 Performance Optimization

### CDN Configuration

- Static asset optimization
- Image compression and optimization
- JavaScript and CSS minification
- Cache header configuration

### Database Optimization

```sql
-- Key performance indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_teams_owner_id ON teams(owner_id);
CREATE INDEX CONCURRENTLY idx_projects_team_id ON projects(team_id);
CREATE INDEX CONCURRENTLY idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY idx_audit_logs_created_at ON audit_logs(created_at);
```

### Caching Strategy

- Redis for session storage
- API response caching
- Database query result caching
- Static asset caching via CDN

## 🔒 Security Post-Deployment

### Security Verification

```bash
# Run security audit
npm audit --audit-level moderate

# Check for common vulnerabilities
node scripts/security-audit.js

# Verify SSL configuration
curl -I https://zenith.engineer
```

### Security Monitoring

- Real-time threat detection
- Failed authentication attempt monitoring
- Unusual traffic pattern alerts
- Data access audit logging

## 📋 Maintenance Procedures

### Regular Maintenance Tasks

**Daily:**
- Health check monitoring
- Error rate analysis
- Performance metrics review
- Security alert review

**Weekly:**
- Database backup verification
- Performance optimization review
- Security patch assessment
- User feedback analysis

**Monthly:**
- Dependency updates
- Security audit
- Performance benchmarking
- Disaster recovery testing

### Scaling Procedures

**Horizontal Scaling:**
- Add additional Vercel serverless functions
- Implement database read replicas
- Configure Redis clustering
- Set up CDN edge locations

**Vertical Scaling:**
- Upgrade database instance
- Increase Redis memory
- Optimize query performance
- Implement caching layers

## 🆘 Incident Response

### Incident Classification

**Critical (P0):**
- Complete service outage
- Data loss or corruption
- Security breach
- Payment processing failure

**High (P1):**
- Major feature unavailable
- Performance degradation > 50%
- Authentication issues
- Email service failure

**Medium (P2):**
- Minor feature issues
- Performance degradation < 50%
- Non-critical integrations down
- UI/UX problems

**Low (P3):**
- Cosmetic issues
- Enhancement requests
- Documentation updates
- Minor performance optimizations

### Response Procedures

1. **Immediate Response (< 5 minutes)**
   - Assess incident severity
   - Implement immediate mitigation
   - Notify stakeholders
   - Begin incident documentation

2. **Investigation (5-30 minutes)**
   - Identify root cause
   - Implement fix or workaround
   - Test solution thoroughly
   - Prepare communication updates

3. **Resolution (30+ minutes)**
   - Deploy fix to production
   - Verify resolution
   - Monitor for related issues
   - Document lessons learned

## 📞 Support & Escalation

### Internal Team Contacts

- **Primary On-Call:** [Your primary contact]
- **Secondary On-Call:** [Your secondary contact]
- **Engineering Lead:** [Engineering lead contact]
- **DevOps Team:** [DevOps contact]

### External Vendor Support

- **Vercel Support:** [Vercel support information]
- **Database Provider:** [Database support information]
- **Redis Provider:** [Redis support information]
- **Stripe Support:** [Stripe support information]

### Escalation Matrix

**P0 Incidents:**
- Immediate notification to all on-call engineers
- Executive notification within 15 minutes
- External vendor escalation if needed
- Customer communication within 30 minutes

**P1 Incidents:**
- Primary on-call engineer notification
- Team lead notification within 30 minutes
- Customer communication within 2 hours

## 📊 Success Metrics

### Deployment Success Criteria

- **Uptime:** 99.9% minimum
- **Response Time:** < 200ms average
- **Error Rate:** < 0.1%
- **User Satisfaction:** > 4.5/5.0

### Business Impact Metrics

- **User Activation:** 70% within 7 days
- **Trial Conversion:** 15% freemium to paid
- **Monthly Churn:** < 5%
- **Support Volume:** < 2% of MAU

### Technical Performance Metrics

- **Build Time:** < 5 minutes
- **Deployment Time:** < 10 minutes
- **Time to Recovery:** < 30 minutes
- **Mean Time Between Failures:** > 720 hours

## 🔄 Continuous Improvement

### Post-Deployment Review

Conduct within 24 hours of major deployments:

1. **What Went Well**
   - Successful automation
   - Effective monitoring
   - Quick issue resolution

2. **Areas for Improvement**
   - Process bottlenecks
   - Missing monitoring
   - Communication gaps

3. **Action Items**
   - Process improvements
   - Tool enhancements
   - Training needs

### Documentation Updates

Keep this guide current by:
- Regular review cycles (monthly)
- Incorporating lessons learned
- Updating contact information
- Revising procedures based on experience

---

## 🎯 Final Notes

This production deployment guide represents enterprise-grade deployment practices for the Zenith Platform. The automated deployment script handles most complexity, but understanding the manual procedures ensures you can handle any situation.

For questions or issues, refer to the internal documentation or contact the engineering team.

**Remember:** When in doubt, prioritize system stability and user experience over rapid deployment.

---

*Last Updated: 2025-06-27*
*Version: 1.0.0*
*Maintained by: Zenith Platform Engineering Team*