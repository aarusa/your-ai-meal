-- Run this SQL in your Supabase SQL editor to create the enhanced meal tracking tables

-- Migration: Enhanced Meal Tracking System
-- Description: Creates enhanced meal tracking tables for AI-generated meals
-- Date: 2024-12-21

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enhanced Meal Logs Table - Track when users consume meals
-- This table tracks when users actually consume meals from their daily plans or generated meals
CREATE TABLE IF NOT EXISTS user_meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Meal reference - can be from ai_generated_meals or custom meals
    ai_meal_id UUID REFERENCES ai_generated_meals(id) ON DELETE SET NULL,
    custom_meal_name VARCHAR(255), -- For custom meals not in ai_generated_meals
    
    -- Meal details (snapshot at time of logging)
    meal_name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    meal_description TEXT,
    meal_image_url VARCHAR(500),
    
    -- Nutritional information (snapshot)
    calories DECIMAL(8,2),
    protein DECIMAL(8,2),
    carbs DECIMAL(8,2),
    fats DECIMAL(8,2),
    fiber DECIMAL(8,2),
    sugar DECIMAL(8,2),
    sodium DECIMAL(8,2),
    
    -- Logging details
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    log_time TIME DEFAULT CURRENT_TIME,
    quantity DECIMAL(8,2) DEFAULT 1.0, -- Portion size multiplier
    portion_notes TEXT, -- e.g., "half portion", "double serving"
    
    -- User feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    was_satisfied BOOLEAN DEFAULT true,
    would_make_again BOOLEAN DEFAULT true,
    
    -- Meal source tracking
    source_type VARCHAR(50) DEFAULT 'ai_generated', -- 'ai_generated', 'custom', 'manual_entry'
    source_plan_date DATE, -- If from daily plan, track which plan date
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Always allow meal logging with just meal_name
    -- No constraint needed since we always have meal_name
);

-- 2. Daily Nutrition Summary - Pre-computed daily totals
-- This table stores daily nutritional summaries for faster queries and analytics
CREATE TABLE IF NOT EXISTS daily_nutrition_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    
    -- Meal counts
    meals_logged INTEGER DEFAULT 0,
    breakfast_logged BOOLEAN DEFAULT false,
    lunch_logged BOOLEAN DEFAULT false,
    dinner_logged BOOLEAN DEFAULT false,
    snacks_logged INTEGER DEFAULT 0,
    
    -- Daily nutritional totals
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fats DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    total_sugar DECIMAL(8,2) DEFAULT 0,
    total_sodium DECIMAL(8,2) DEFAULT 0,
    
    -- Goal tracking
    calories_goal DECIMAL(8,2), -- User's daily calorie goal
    protein_goal DECIMAL(8,2), -- User's daily protein goal
    goal_achievement_percentage DECIMAL(5,2), -- Percentage of goals achieved
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one summary per user per day
    UNIQUE(user_id, summary_date)
);

-- 3. Meal Tracking Preferences - User preferences for meal tracking
CREATE TABLE IF NOT EXISTS meal_tracking_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Daily goals
    daily_calorie_goal DECIMAL(8,2),
    daily_protein_goal DECIMAL(8,2),
    daily_carbs_goal DECIMAL(8,2),
    daily_fats_goal DECIMAL(8,2),
    
    -- Tracking preferences
    auto_log_from_plan BOOLEAN DEFAULT false, -- Auto-log when accepting daily plan meals
    require_rating BOOLEAN DEFAULT false, -- Require rating for each logged meal
    enable_reminders BOOLEAN DEFAULT false, -- Enable meal logging reminders
    reminder_times TIME[], -- Array of reminder times
    
    -- Display preferences
    preferred_units VARCHAR(20) DEFAULT 'metric', -- 'metric' or 'imperial'
    show_macros BOOLEAN DEFAULT true,
    show_micros BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one preference record per user
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_meal_logs_user_date ON user_meal_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_user_meal_logs_meal_type ON user_meal_logs(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_user_meal_logs_ai_meal_id ON user_meal_logs(ai_meal_id);
CREATE INDEX IF NOT EXISTS idx_user_meal_logs_source_plan ON user_meal_logs(source_plan_date);

CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON daily_nutrition_summary(user_id, summary_date);
CREATE INDEX IF NOT EXISTS idx_meal_tracking_prefs_user ON meal_tracking_preferences(user_id);

-- Create function to update daily nutrition summary
CREATE OR REPLACE FUNCTION update_daily_nutrition_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update daily nutrition summary
    INSERT INTO daily_nutrition_summary (
        user_id, 
        summary_date,
        meals_logged,
        breakfast_logged,
        lunch_logged,
        dinner_logged,
        snacks_logged,
        total_calories,
        total_protein,
        total_carbs,
        total_fats,
        total_fiber,
        total_sugar,
        total_sodium
    )
    SELECT 
        NEW.user_id,
        NEW.log_date,
        COUNT(*) as meals_logged,
        BOOL_OR(meal_type = 'breakfast') as breakfast_logged,
        BOOL_OR(meal_type = 'lunch') as lunch_logged,
        BOOL_OR(meal_type = 'dinner') as dinner_logged,
        COUNT(*) FILTER (WHERE meal_type = 'snack') as snacks_logged,
        SUM(calories * quantity) as total_calories,
        SUM(protein * quantity) as total_protein,
        SUM(carbs * quantity) as total_carbs,
        SUM(fats * quantity) as total_fats,
        SUM(fiber * quantity) as total_fiber,
        SUM(sugar * quantity) as total_sugar,
        SUM(sodium * quantity) as total_sodium
    FROM user_meal_logs
    WHERE user_id = NEW.user_id AND log_date = NEW.log_date
    ON CONFLICT (user_id, summary_date) 
    DO UPDATE SET
        meals_logged = EXCLUDED.meals_logged,
        breakfast_logged = EXCLUDED.breakfast_logged,
        lunch_logged = EXCLUDED.lunch_logged,
        dinner_logged = EXCLUDED.dinner_logged,
        snacks_logged = EXCLUDED.snacks_logged,
        total_calories = EXCLUDED.total_calories,
        total_protein = EXCLUDED.total_protein,
        total_carbs = EXCLUDED.total_carbs,
        total_fats = EXCLUDED.total_fats,
        total_fiber = EXCLUDED.total_fiber,
        total_sugar = EXCLUDED.total_sugar,
        total_sodium = EXCLUDED.total_sodium,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update daily nutrition summary
DROP TRIGGER IF EXISTS trigger_update_daily_nutrition ON user_meal_logs;
CREATE TRIGGER trigger_update_daily_nutrition
    AFTER INSERT OR UPDATE OR DELETE ON user_meal_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_nutrition_summary();

-- Create function to calculate goal achievement percentage
CREATE OR REPLACE FUNCTION calculate_goal_achievement(
    user_uuid UUID,
    target_date DATE
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    achievement DECIMAL(5,2);
    calorie_goal DECIMAL(8,2);
    actual_calories DECIMAL(8,2);
BEGIN
    -- Get user's calorie goal
    SELECT daily_calorie_goal INTO calorie_goal
    FROM meal_tracking_preferences
    WHERE user_id = user_uuid;
    
    -- Get actual calories consumed
    SELECT total_calories INTO actual_calories
    FROM daily_nutrition_summary
    WHERE user_id = user_uuid AND summary_date = target_date;
    
    -- Calculate achievement percentage
    IF calorie_goal IS NULL OR calorie_goal = 0 THEN
        achievement := NULL;
    ELSE
        achievement := (actual_calories / calorie_goal) * 100;
    END IF;
    
    RETURN achievement;
END;
$$ LANGUAGE plpgsql;

-- Update daily nutrition summary to include goal achievement
CREATE OR REPLACE FUNCTION update_goal_achievement()
RETURNS TRIGGER AS $$
DECLARE
    achievement DECIMAL(5,2);
BEGIN
    achievement := calculate_goal_achievement(NEW.user_id, NEW.summary_date);
    
    UPDATE daily_nutrition_summary
    SET goal_achievement_percentage = achievement,
        calories_goal = (SELECT daily_calorie_goal FROM meal_tracking_preferences WHERE user_id = NEW.user_id),
        protein_goal = (SELECT daily_protein_goal FROM meal_tracking_preferences WHERE user_id = NEW.user_id)
    WHERE user_id = NEW.user_id AND summary_date = NEW.summary_date;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update goal achievement
DROP TRIGGER IF EXISTS trigger_update_goal_achievement ON daily_nutrition_summary;
CREATE TRIGGER trigger_update_goal_achievement
    AFTER INSERT OR UPDATE ON daily_nutrition_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_achievement();

-- Success message
SELECT 'Enhanced meal tracking tables created successfully!' as message;
