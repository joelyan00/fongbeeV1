#!/bin/bash
# Credits and Subscription System - Database Migration Script

echo "🚀 Starting Credits and Subscription System Migration..."

# Database connection details
DB_HOST="${SUPABASE_DB_HOST:-db.your-project.supabase.co}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"

# Check if migration file exists
MIGRATION_FILE="backend/database/migrations/001_create_credits_subscription_tables.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file found: $MIGRATION_FILE"
echo ""
echo "⚠️  IMPORTANT: This script will create the following:"
echo "   - custom_service_categories table"
echo "   - subscription_plans table"
echo "   - user_subscriptions table"
echo "   - Extend credits_transactions table"
echo "   - Extend providers table"
echo ""
echo "Please ensure you have:"
echo "1. Backed up your database"
echo "2. Set the correct database connection details"
echo "3. Have admin access to the database"
echo ""

read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Running migration..."
echo ""

# Run migration using psql
# Note: You may need to adjust this command based on your Supabase setup
# For Supabase, you might need to use their connection string

# Option 1: Using psql directly
# psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -f $MIGRATION_FILE

# Option 2: Using Supabase CLI (if installed)
# supabase db push

# Option 3: Manual instruction
echo "📋 Please run the following SQL file in your Supabase SQL Editor:"
echo ""
echo "   File: $MIGRATION_FILE"
echo ""
echo "   Or use the Supabase CLI:"
echo "   supabase db push"
echo ""
echo "   Or use psql:"
echo "   psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f $MIGRATION_FILE"
echo ""

read -p "Have you run the migration? (yes/no): " migration_done

if [ "$migration_done" == "yes" ]; then
    echo ""
    echo "✅ Migration completed!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Verify tables were created:"
    echo "   - custom_service_categories"
    echo "   - subscription_plans"
    echo "   - user_subscriptions"
    echo ""
    echo "2. Check default data:"
    echo "   SELECT * FROM custom_service_categories;"
    echo "   SELECT * FROM subscription_plans;"
    echo ""
    echo "3. Update existing providers:"
    echo "   UPDATE providers SET user_type = 'credits' WHERE user_type IS NULL;"
    echo ""
    echo "4. Restart backend server to load new routes"
    echo ""
else
    echo "⚠️  Please run the migration manually and restart this script"
fi
