-- Migration: AI Meal Generation System
-- Description: Creates tables for AI-powered meal generation system
-- Date: 2024-12-20

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products table - Food database items (USDA, Edamam, etc.)
-- Stores comprehensive product information from external food databases including nutritional data,
-- dietary restrictions, images, barcodes, and Nutri-Score ratings for AI meal generation.
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255), -- ID from external food database (USDA, Edamam, etc.)
    external_source VARCHAR(100), -- 'usda', 'edamam', 'spoonacular', etc.
    
    -- Basic information
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    category VARCHAR(100), -- e.g., 'vegetables', 'proteins', 'grains', 'dairy', 'spices'
    subcategory VARCHAR(100), -- e.g., 'leafy_greens', 'red_meat', 'whole_grains'
    
    -- Product identification
    barcode VARCHAR(50), -- Product barcode (UPC, EAN, etc.)
    
    -- Images
    image_url VARCHAR(500), -- Primary product image URL
    image_urls VARCHAR(500)[], -- Additional product images
    thumbnail_url VARCHAR(500), -- Thumbnail image URL for faster loading
    
    -- Nutritional information per 100g
    calories_per_100g DECIMAL(8,2),
    energy_kcal_100g DECIMAL(8,2), -- Energy in kcal per 100g (alternative to calories)
    protein_per_100g DECIMAL(8,2),
    carbs_per_100g DECIMAL(8,2),
    carbohydrates_100g DECIMAL(8,2), -- Carbohydrates per 100g (alternative to carbs)
    fats_per_100g DECIMAL(8,2),
    fiber_per_100g DECIMAL(8,2),
    sugar_per_100g DECIMAL(8,2),
    sodium_per_100g DECIMAL(8,2),
    salt_100g DECIMAL(8,2), -- Salt per 100g (alternative to sodium)
    saturated_fat_per_100g DECIMAL(8,2),
    trans_fat_per_100g DECIMAL(8,2),
    cholesterol_per_100g DECIMAL(8,2),
    
    -- Dietary restrictions (from food database)
    is_halal BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_kosher BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_dairy_free BOOLEAN DEFAULT false,
    is_nut_free BOOLEAN DEFAULT false,
    is_soy_free BOOLEAN DEFAULT false,
    is_shellfish_free BOOLEAN DEFAULT false,
    is_egg_free BOOLEAN DEFAULT false,
    is_fish_free BOOLEAN DEFAULT false,
    is_palm_oil_free BOOLEAN DEFAULT false,
    
    -- Common units and measurements
    common_units VARCHAR(100)[], -- ['cup', 'tbsp', 'piece', 'gram', 'pound']
    serving_size_grams DECIMAL(8,2), -- Standard serving size
    
    -- Nutritional rating
    nutriscore_grade VARCHAR(1), -- Nutri-Score grade: A, B, C, D, E
    
    -- AI and search optimization
    search_keywords TEXT[], -- For better AI matching
    ai_tags TEXT[], -- AI-generated tags for better categorization
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Ensure unique external products
    UNIQUE(external_id, external_source),
    
    -- Ensure unique barcodes
    UNIQUE(barcode),
    
    -- Ensure valid Nutri-Score grade
    CHECK (nutriscore_grade IS NULL OR nutriscore_grade IN ('A', 'B', 'C', 'D', 'E'))
);

-- 2. User Pantry Items - User's personal pantry inventory
-- Manages user's personal food inventory including both food database items and custom user-added products.
-- Tracks quantities, expiration dates, storage locations, and usage statistics for meal planning.
CREATE TABLE IF NOT EXISTS user_pantry_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Link to products table (optional - for food database items)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Custom item information (when not from products table)
    custom_name VARCHAR(255), -- Required when product_id is NULL
    custom_description TEXT,
    custom_category VARCHAR(100),
    custom_brand VARCHAR(255),
    custom_image_url VARCHAR(500), -- Custom item image URL
    
    -- Nutritional information (for custom items or overrides)
    calories_per_100g DECIMAL(8,2),
    protein_per_100g DECIMAL(8,2),
    carbs_per_100g DECIMAL(8,2),
    fats_per_100g DECIMAL(8,2),
    fiber_per_100g DECIMAL(8,2),
    sugar_per_100g DECIMAL(8,2),
    sodium_per_100g DECIMAL(8,2),
    
    -- Dietary restrictions (for custom items or overrides)
    is_halal BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_kosher BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_dairy_free BOOLEAN DEFAULT false,
    is_nut_free BOOLEAN DEFAULT false,
    is_soy_free BOOLEAN DEFAULT false,
    is_shellfish_free BOOLEAN DEFAULT false,
    is_egg_free BOOLEAN DEFAULT false,
    
    -- Quantity and unit information
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL, -- 'cup', 'tbsp', 'piece', 'gram', 'pound'
    quantity_in_grams DECIMAL(10,3), -- Converted to grams for calculations
    
    -- Purchase and expiration tracking
    purchase_date DATE,
    expiration_date DATE,
    is_expired BOOLEAN DEFAULT false,
    
    -- Storage information
    storage_location VARCHAR(100), -- 'pantry', 'refrigerator', 'freezer', 'counter'
    storage_notes TEXT,
    
    -- Usage tracking
    last_used_date DATE,
    usage_count INTEGER DEFAULT 0,
    last_used_in_meal_id UUID, -- Track which meal it was last used in
    
    -- User notes and preferences
    user_notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    
    -- Item type
    item_type VARCHAR(20) DEFAULT 'food_database', -- 'food_database', 'custom'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either product_id or custom_name is provided
    CHECK (
        (product_id IS NOT NULL AND custom_name IS NULL) OR 
        (product_id IS NULL AND custom_name IS NOT NULL)
    )
);

-- 3. AI Generated Meals - Meals created by AI
-- Stores AI-generated meal recipes with complete nutritional breakdown, cooking instructions,
-- and user interaction data. Includes images and tracks user ratings and feedback.
CREATE TABLE IF NOT EXISTS ai_generated_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Meal basic information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meal_type VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    
    -- Images
    image_url VARCHAR(500), -- Primary meal image URL
    image_urls VARCHAR(500)[], -- Additional meal images
    thumbnail_url VARCHAR(500), -- Thumbnail image URL for faster loading
    
    -- Nutritional information
    total_calories DECIMAL(8,2),
    total_protein DECIMAL(8,2),
    total_carbs DECIMAL(8,2),
    total_fats DECIMAL(8,2),
    total_fiber DECIMAL(8,2),
    total_sugar DECIMAL(8,2),
    total_sodium DECIMAL(8,2),
    
    -- Cooking information
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER,
    difficulty_level VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    servings INTEGER DEFAULT 1,
    
    -- AI generation context
    generation_type VARCHAR(50) NOT NULL, -- 'daily_recommendation', 'pantry_based', 'custom_criteria'
    generation_criteria JSONB, -- Store the criteria used for generation
    ai_model_version VARCHAR(50),
    generation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User interaction
    is_favorited BOOLEAN DEFAULT false,
    is_rated BOOLEAN DEFAULT false,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'generated', -- 'generated', 'accepted', 'rejected', 'cooked'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Meal Ingredients - Ingredients used in AI generated meals
-- Links AI-generated meals to their ingredients from either pantry items or food database products.
-- Tracks nutritional contributions, preparation methods, and substitution suggestions.
CREATE TABLE IF NOT EXISTS meal_ingredients_ai (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES ai_generated_meals(id) ON DELETE CASCADE,
    pantry_item_id UUID REFERENCES user_pantry_items(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Ingredient information
    ingredient_name VARCHAR(255) NOT NULL, -- In case pantry item or product is deleted
    ingredient_brand VARCHAR(255),
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity_in_grams DECIMAL(10,3),
    
    -- Nutritional contribution
    calories_contribution DECIMAL(8,2),
    protein_contribution DECIMAL(8,2),
    carbs_contribution DECIMAL(8,2),
    fats_contribution DECIMAL(8,2),
    
    -- Preparation instructions
    preparation_notes TEXT,
    cooking_method VARCHAR(100), -- 'raw', 'boiled', 'fried', 'baked', 'steamed'
    
    -- Optional/required
    is_optional BOOLEAN DEFAULT false,
    substitution_suggestions TEXT[],
    
    -- Ingredient source
    ingredient_source VARCHAR(20) DEFAULT 'pantry', -- 'pantry', 'food_database', 'custom'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure at least one source is provided
    CHECK (pantry_item_id IS NOT NULL OR product_id IS NOT NULL)
);

-- 5. Meal Generation Requests - Track AI generation requests
-- Records user requests for AI meal generation including custom criteria, preferences,
-- and processing status. Stores generation parameters and results for analytics.
CREATE TABLE IF NOT EXISTS meal_generation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Request type
    request_type VARCHAR(50) NOT NULL, -- 'daily_recommendation', 'pantry_based', 'custom_criteria'
    
    -- Custom criteria (for custom generation)
    target_calories INTEGER,
    target_protein DECIMAL(8,2),
    target_carbs DECIMAL(8,2),
    target_fats DECIMAL(8,2),
    meal_type VARCHAR(50), -- 'breakfast', 'lunch', 'dinner', 'snack'
    cooking_time_max INTEGER, -- Maximum cooking time in minutes
    servings INTEGER DEFAULT 1,
    
    -- Preferences and restrictions (arrays cannot have foreign key constraints)
    cuisine_preferences INTEGER[], -- References cuisines(id)
    dietary_preferences INTEGER[], -- References dietary_preferences(id)
    allergies INTEGER[], -- References allergies(id)
    pantry_item_ids UUID[], -- References user_pantry_items(id)
    
    -- Additional preferences
    exclude_ingredients TEXT[],
    include_ingredients TEXT[],
    cooking_methods VARCHAR(100)[],
    difficulty_preference VARCHAR(20),
    
    -- Request status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    generated_meal_ids UUID[], -- References ai_generated_meals(id)
    
    -- AI processing
    ai_model_version VARCHAR(50),
    processing_time_seconds INTEGER,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Daily Meal Plans - Daily meal recommendations
-- Stores complete daily meal plans generated for users including breakfast, lunch, dinner, and snacks.
-- Tracks daily nutritional totals, user acceptance, and feedback for continuous improvement.
CREATE TABLE IF NOT EXISTS daily_meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    
    -- Generated meals for the day
    breakfast_meal_id UUID REFERENCES ai_generated_meals(id),
    lunch_meal_id UUID REFERENCES ai_generated_meals(id),
    dinner_meal_id UUID REFERENCES ai_generated_meals(id),
    snack_meal_ids UUID[], -- References ai_generated_meals(id)
    
    -- Daily totals
    total_calories DECIMAL(8,2),
    total_protein DECIMAL(8,2),
    total_carbs DECIMAL(8,2),
    total_fats DECIMAL(8,2),
    
    -- User interaction
    is_accepted BOOLEAN DEFAULT false,
    acceptance_date TIMESTAMP WITH TIME ZONE,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Generation context
    generation_criteria JSONB,
    ai_model_version VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one plan per user per day
    UNIQUE(user_id, plan_date)
);

-- 7. Meal Generation History - Track generation patterns and preferences
-- Records historical data of meal generations and user interactions for AI learning and analytics.
-- Tracks cooking success, ratings, and feedback to improve future recommendations.
CREATE TABLE IF NOT EXISTS meal_generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_id UUID NOT NULL REFERENCES ai_generated_meals(id) ON DELETE CASCADE,
    
    -- Generation context
    generation_type VARCHAR(50) NOT NULL,
    generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User interaction
    was_cooked BOOLEAN DEFAULT false,
    cooking_date TIMESTAMP WITH TIME ZONE,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Learning data for AI improvement
    interaction_data JSONB, -- Store detailed interaction data
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Product Categories - Standardized product categories
-- Hierarchical categorization system for products enabling better organization and filtering.
-- Supports parent-child relationships for detailed product classification.
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER REFERENCES product_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Product Allergens - Allergen information for products
-- Links products to their allergen information with severity levels and notes.
-- Enables comprehensive allergen tracking for food safety and dietary restrictions.
CREATE TABLE IF NOT EXISTS product_allergens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    allergen_id INTEGER NOT NULL REFERENCES allergies(id) ON DELETE CASCADE,
    severity VARCHAR(20) DEFAULT 'moderate', -- 'mild', 'moderate', 'severe'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, allergen_id)
);

-- 10. Pantry Item Allergens - Allergen information for custom pantry items
-- Links custom pantry items to their allergen information with severity levels and notes.
-- Provides allergen tracking for user-added products to ensure food safety.
CREATE TABLE IF NOT EXISTS pantry_item_allergens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pantry_item_id UUID NOT NULL REFERENCES user_pantry_items(id) ON DELETE CASCADE,
    allergen_id INTEGER NOT NULL REFERENCES allergies(id) ON DELETE CASCADE,
    severity VARCHAR(20) DEFAULT 'moderate', -- 'mild', 'moderate', 'severe'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pantry_item_id, allergen_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_pantry_items_user_id ON user_pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pantry_items_product_id ON user_pantry_items(product_id);
CREATE INDEX IF NOT EXISTS idx_user_pantry_items_expiration ON user_pantry_items(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_pantry_items_item_type ON user_pantry_items(item_type);
CREATE INDEX IF NOT EXISTS idx_user_pantry_items_storage_location ON user_pantry_items(storage_location);

CREATE INDEX IF NOT EXISTS idx_products_external_source ON products(external_source);
CREATE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_dietary_restrictions ON products(is_halal, is_vegan, is_vegetarian, is_kosher);
CREATE INDEX IF NOT EXISTS idx_products_search_keywords ON products USING GIN(search_keywords);
CREATE INDEX IF NOT EXISTS idx_products_ai_tags ON products USING GIN(ai_tags);

CREATE INDEX IF NOT EXISTS idx_ai_generated_meals_user_id ON ai_generated_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_meals_generation_type ON ai_generated_meals(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_meals_meal_type ON ai_generated_meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_meals_generation_timestamp ON ai_generated_meals(generation_timestamp);

CREATE INDEX IF NOT EXISTS idx_meal_ingredients_ai_meal_id ON meal_ingredients_ai(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_ai_pantry_item_id ON meal_ingredients_ai(pantry_item_id);
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_ai_product_id ON meal_ingredients_ai(product_id);

CREATE INDEX IF NOT EXISTS idx_meal_generation_requests_user_id ON meal_generation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_generation_requests_request_type ON meal_generation_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_meal_generation_requests_status ON meal_generation_requests(status);
CREATE INDEX IF NOT EXISTS idx_meal_generation_requests_created_at ON meal_generation_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_meal_plans_user_id ON daily_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_meal_plans_plan_date ON daily_meal_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_meal_plans_user_date ON daily_meal_plans(user_id, plan_date);

CREATE INDEX IF NOT EXISTS idx_meal_generation_history_user_id ON meal_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_generation_history_meal_id ON meal_generation_history(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_generation_history_generation_date ON meal_generation_history(generation_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_pantry_items_updated_at BEFORE UPDATE ON user_pantry_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_generated_meals_updated_at BEFORE UPDATE ON ai_generated_meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_meal_plans_updated_at BEFORE UPDATE ON daily_meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample product categories
INSERT INTO product_categories (name, description) VALUES
('Vegetables', 'Fresh and frozen vegetables'),
('Fruits', 'Fresh and frozen fruits'),
('Proteins', 'Meat, poultry, fish, legumes, and plant-based proteins'),
('Grains', 'Rice, wheat, oats, quinoa, and other grains'),
('Dairy', 'Milk, cheese, yogurt, and dairy products'),
('Spices & Herbs', 'Seasonings, herbs, and spices'),
('Pantry Staples', 'Canned goods, oils, vinegars, and shelf-stable items'),
('Beverages', 'Drinks and liquid ingredients'),
('Frozen Foods', 'Frozen meals and ingredients'),
('Bakery', 'Bread, pastries, and baked goods')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample products with comprehensive nutritional and dietary information
INSERT INTO products (name, description, category, subcategory, calories_per_100g, energy_kcal_100g, protein_per_100g, carbs_per_100g, carbohydrates_100g, fats_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, salt_100g, is_halal, is_vegan, is_vegetarian, is_gluten_free, is_dairy_free, is_fish_free, is_palm_oil_free, common_units, search_keywords, image_url, thumbnail_url, nutriscore_grade, barcode) VALUES
('Chicken Breast', 'Boneless, skinless chicken breast', 'Proteins', 'Poultry', 165, 165, 31, 0, 0, 3.6, 0, 0, 74, 0.19, true, false, false, true, true, true, true, '{"piece", "gram", "pound"}', '{"chicken", "poultry", "protein", "meat"}', '/placeholder.svg', '/placeholder.svg', 'A', '1234567890123'),
('Quinoa', 'Ancient grain, high in protein', 'Grains', 'Ancient Grains', 368, 368, 14, 64, 64, 6, 7, 0, 5, 0.01, true, true, true, true, true, true, true, '{"cup", "gram", "pound"}', '{"quinoa", "grain", "protein", "gluten-free"}', '/placeholder.svg', '/placeholder.svg', 'A', '2345678901234'),
('Almonds', 'Raw almonds, high in healthy fats', 'Proteins', 'Nuts', 579, 579, 21, 22, 22, 50, 12, 4.4, 1, 0.003, true, true, true, true, true, true, true, '{"cup", "gram", "ounce", "piece"}', '{"almonds", "nuts", "healthy fats", "snack"}', '/placeholder.svg', '/placeholder.svg', 'C', '3456789012345'),
('Greek Yogurt', 'High protein yogurt', 'Dairy', 'Yogurt', 59, 59, 10, 3.6, 3.6, 0.4, 0, 3.6, 36, 0.09, true, false, true, true, false, true, true, '{"cup", "gram", "tbsp"}', '{"yogurt", "dairy", "protein", "probiotic"}', '/placeholder.svg', '/placeholder.svg', 'A', '4567890123456'),
('Olive Oil', 'Extra virgin olive oil', 'Pantry Staples', 'Oils', 884, 884, 0, 0, 0, 100, 0, 0, 2, 0.005, true, true, true, true, true, true, true, '{"tbsp", "cup", "ml"}', '{"olive oil", "healthy fat", "cooking oil"}', '/placeholder.svg', '/placeholder.svg', 'C', '5678901234567'),
('Spinach', 'Fresh spinach leaves', 'Vegetables', 'Leafy Greens', 23, 23, 2.9, 3.6, 3.6, 0.4, 2.2, 0.4, 79, 0.2, true, true, true, true, true, true, true, '{"cup", "gram", "bunch"}', '{"spinach", "leafy greens", "iron", "vegetables"}', '/placeholder.svg', '/placeholder.svg', 'A', '6789012345678')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_ingredients_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_item_allergens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table (public read access)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are insertable by authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for user_pantry_items table (user-specific access)
CREATE POLICY "Users can view their own pantry items" ON user_pantry_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items" ON user_pantry_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items" ON user_pantry_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items" ON user_pantry_items
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_generated_meals table (user-specific access)
CREATE POLICY "Users can view their own generated meals" ON ai_generated_meals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated meals" ON ai_generated_meals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated meals" ON ai_generated_meals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated meals" ON ai_generated_meals
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meal_ingredients_ai table (user-specific access through meals)
CREATE POLICY "Users can view ingredients of their own meals" ON meal_ingredients_ai
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_generated_meals 
            WHERE ai_generated_meals.id = meal_ingredients_ai.meal_id 
            AND ai_generated_meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ingredients to their own meals" ON meal_ingredients_ai
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_generated_meals 
            WHERE ai_generated_meals.id = meal_ingredients_ai.meal_id 
            AND ai_generated_meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update ingredients of their own meals" ON meal_ingredients_ai
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM ai_generated_meals 
            WHERE ai_generated_meals.id = meal_ingredients_ai.meal_id 
            AND ai_generated_meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete ingredients of their own meals" ON meal_ingredients_ai
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM ai_generated_meals 
            WHERE ai_generated_meals.id = meal_ingredients_ai.meal_id 
            AND ai_generated_meals.user_id = auth.uid()
        )
    );

-- RLS Policies for meal_generation_requests table (user-specific access)
CREATE POLICY "Users can view their own generation requests" ON meal_generation_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation requests" ON meal_generation_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation requests" ON meal_generation_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generation requests" ON meal_generation_requests
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_meal_plans table (user-specific access)
CREATE POLICY "Users can view their own meal plans" ON daily_meal_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans" ON daily_meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" ON daily_meal_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" ON daily_meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meal_generation_history table (user-specific access)
CREATE POLICY "Users can view their own generation history" ON meal_generation_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation history" ON meal_generation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation history" ON meal_generation_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generation history" ON meal_generation_history
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for product_categories table (public read access)
CREATE POLICY "Product categories are viewable by everyone" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "Product categories are insertable by authenticated users" ON product_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Product categories are updatable by authenticated users" ON product_categories
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for product_allergens table (public read access)
CREATE POLICY "Product allergens are viewable by everyone" ON product_allergens
    FOR SELECT USING (true);

CREATE POLICY "Product allergens are insertable by authenticated users" ON product_allergens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Product allergens are updatable by authenticated users" ON product_allergens
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for pantry_item_allergens table (user-specific access through pantry items)
CREATE POLICY "Users can view allergens of their own pantry items" ON pantry_item_allergens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_pantry_items 
            WHERE user_pantry_items.id = pantry_item_allergens.pantry_item_id 
            AND user_pantry_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert allergens to their own pantry items" ON pantry_item_allergens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_pantry_items 
            WHERE user_pantry_items.id = pantry_item_allergens.pantry_item_id 
            AND user_pantry_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update allergens of their own pantry items" ON pantry_item_allergens
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_pantry_items 
            WHERE user_pantry_items.id = pantry_item_allergens.pantry_item_id 
            AND user_pantry_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete allergens of their own pantry items" ON pantry_item_allergens
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_pantry_items 
            WHERE user_pantry_items.id = pantry_item_allergens.pantry_item_id 
            AND user_pantry_items.user_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE products IS 'Food database items from external sources (USDA, Edamam, etc.) with nutritional and dietary information';
COMMENT ON TABLE user_pantry_items IS 'User pantry - personal inventory including both food database items and custom user-added items';
COMMENT ON TABLE ai_generated_meals IS 'Meals generated by AI based on user preferences and criteria';
COMMENT ON TABLE meal_ingredients_ai IS 'Ingredients used in AI-generated meals, can reference pantry items or food database products';
COMMENT ON TABLE meal_generation_requests IS 'Tracks AI meal generation requests and their parameters';
COMMENT ON TABLE daily_meal_plans IS 'Daily meal recommendations generated for users';
COMMENT ON TABLE meal_generation_history IS 'Historical data of meal generations for AI learning and analytics';
COMMENT ON TABLE product_categories IS 'Hierarchical categorization of products';
COMMENT ON TABLE product_allergens IS 'Allergen information for food database products';
COMMENT ON TABLE pantry_item_allergens IS 'Allergen information for custom pantry items';
