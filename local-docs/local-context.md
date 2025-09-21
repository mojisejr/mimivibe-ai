# Local Development Database Context

**Created**: 2025-09-20 16:04:18  
**Purpose**: Local development database synchronization and management  
**Environment**: Local PostgreSQL Docker container  

## Overview

This document provides comprehensive guidance for managing the local development database environment, including synchronization with staging data for testing and development purposes.

## Local Database Configuration

### Connection Details
- **Host**: localhost
- **Port**: 5433
- **Database**: mimivibe_dev
- **User**: mimi
- **Password**: mimi_dev
- **Schema**: public

### Environment Variables (.env.local)
```bash
# Local PostgreSQL Database Configuration
DATABASE_URL="postgresql://mimi:mimi_dev@localhost:5433/mimivibe_dev?schema=public"
DIRECT_URL="postgresql://mimi:mimi_dev@localhost:5433/mimivibe_dev?schema=public"

# Database Connection Details
DB_HOST=localhost
DB_PORT=5433
DB_NAME=mimivibe_dev
DB_USER=mimi
DB_PASSWORD=mimi_dev
```

## Database Synchronization System

### Available Scripts

#### 1. Local Database Sync
```bash
# Sync staging data to local development database
npm run db:sync-local

# Or run directly
node scripts/sync-local-data.js
```

**Purpose**: Clean up local database and import staging data for development and testing.

**Process**:
1. Checks local database connection
2. Prompts for user confirmation
3. Disables foreign key constraints
4. Truncates all tables in dependency order
5. Re-enables foreign key constraints
6. Imports data from `local-docs/transfer-to-staging.sql`
7. Verifies import success with record counts

#### 2. Local Database Reset
```bash
# Reset local database with seed data
npm run db:dev:reset

# Generate Prisma client for local development
npm run db:dev:generate

# Open Prisma Studio for local database
npm run db:dev:studio
```

### Supported Tables

The sync system handles the following tables in proper dependency order:

**Core Tables**:
- `TarotCard` - Tarot card definitions and meanings
- `Spread` - Card spread configurations
- `User` - User accounts and profiles
- `Reading` - Tarot reading history and results

**Gamification Tables**:
- `UserStats` - User statistics and progression
- `Achievement` - Achievement definitions
- `UserAchievement` - User achievement progress

**Payment Tables**:
- `Payment` - Payment transaction history
- `CreditTransaction` - Credit balance changes

**Campaign Tables**:
- `Campaign` - Marketing campaign definitions
- `UserCampaign` - User campaign participation

## Usage Workflows

### 1. Initial Local Setup

```bash
# 1. Ensure PostgreSQL Docker container is running
docker-compose up -d postgres

# 2. Verify database connection
psql "postgresql://mimi:mimi_dev@localhost:5433/mimivibe_dev" -c "SELECT 1;"

# 3. Run Prisma migrations
npx dotenv -e .env.local -- npx prisma migrate dev

# 4. Generate Prisma client
npm run db:dev:generate
```

### 2. Sync with Staging Data

```bash
# 1. Ensure transfer-to-staging.sql exists
ls -la local-docs/transfer-to-staging.sql

# 2. Run local database sync
npm run db:sync-local

# 3. Verify data import
npm run db:dev:studio
```

### 3. Development Testing

```bash
# 1. Start development server
npm run dev

# 2. Test with imported data
# - Login with existing user accounts
# - Test reading functionality
# - Verify payment history
# - Check achievement progress

# 3. Monitor for issues
# - Check console for database errors
# - Verify data relationships
# - Test CRUD operations
```

## Security & Safety

### Local Environment Safety
- **Isolated Environment**: Local database is completely isolated from production
- **Development Credentials**: Uses development-only credentials
- **No Production Access**: Cannot accidentally affect production data
- **Docker Container**: Runs in containerized environment

### Data Handling
- **Staging Data Only**: Imports staging data, not production data
- **Temporary Files**: SQL files should be cleaned up after sync
- **No Sensitive Data**: Local environment should not contain real user data
- **Development Testing**: Safe for testing and development purposes

### Best Practices
- **Regular Cleanup**: Clean up SQL files after successful sync
- **Container Management**: Restart Docker container if connection issues occur
- **Environment Separation**: Keep local, staging, and production environments separate
- **Backup Strategy**: Local data is disposable and can be re-synced anytime

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check Docker container status
docker ps | grep postgres

# Restart PostgreSQL container
docker-compose restart postgres

# Verify port availability
lsof -i :5433
```

#### 2. SQL File Not Found
```bash
# Check if transfer-to-staging.sql exists
ls -la local-docs/transfer-to-staging.sql

# If missing, export from staging first
npm run db:export-production
```

#### 3. Permission Errors
```bash
# Check file permissions
chmod +x scripts/sync-local-data.js

# Verify psql installation
which psql
psql --version
```

#### 4. Table Truncation Errors
```bash
# Check table dependencies
psql "postgresql://mimi:mimi_dev@localhost:5433/mimivibe_dev" -c "\dt"

# Manually reset if needed
npm run db:dev:reset
```

### Error Resolution

#### Foreign Key Constraint Errors
- The script automatically handles foreign key constraints
- If errors persist, check table dependency order
- Consider running `db:dev:reset` for clean slate

#### Import Verification Failures
- Check SQL file format and content
- Verify table names match Prisma schema
- Ensure data types are compatible

#### Connection Timeout
- Restart Docker container
- Check network connectivity
- Verify DATABASE_URL format

## Integration with Development Workflow

### Pre-Development Setup
1. Sync local database with staging data
2. Verify all tables have expected data
3. Test critical user journeys
4. Confirm authentication works with imported users

### During Development
1. Use local database for all testing
2. Monitor console for database errors
3. Test new features with realistic data
4. Verify data relationships remain intact

### Post-Development Testing
1. Test with fresh staging data sync
2. Verify no data corruption occurred
3. Confirm all features work with imported data
4. Clean up temporary files and logs

## Maintenance

### Regular Tasks
- **Weekly**: Sync with latest staging data
- **Monthly**: Clean up old SQL files
- **As Needed**: Restart Docker container for performance

### Monitoring
- **Database Size**: Monitor local database growth
- **Container Health**: Check Docker container status
- **Connection Performance**: Monitor query response times
- **Error Logs**: Review application logs for database errors

### Updates
- **Schema Changes**: Run Prisma migrations after schema updates
- **New Tables**: Update sync script if new tables are added
- **Dependency Changes**: Verify table cleanup order remains correct

---

## Related Documentation

- **Staging Context**: `local-docs/staging-context.md`
- **Database URLs**: `local-docs/database-url.md`
- **CI/CD Plan**: `local-docs/cicd-plan.md`
- **Environment Setup**: `README.md`

## Support

For issues with local database setup or synchronization:
1. Check this documentation first
2. Review error messages and logs
3. Try troubleshooting steps above
4. Restart Docker container if needed
5. Re-sync with staging data as last resort