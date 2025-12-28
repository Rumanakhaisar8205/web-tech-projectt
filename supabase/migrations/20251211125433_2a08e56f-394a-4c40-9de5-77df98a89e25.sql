-- Create nutrition_items table for food nutrition data
CREATE TABLE public.nutrition_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  serving_size_grams NUMERIC NOT NULL DEFAULT 100,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_logs table for tracking logged meals
CREATE TABLE public.meal_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  food_name TEXT NOT NULL,
  grams NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  image_url TEXT,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for nutrition items (reference data)
CREATE POLICY "Nutrition items are publicly readable" 
ON public.nutrition_items 
FOR SELECT 
USING (true);

-- Public access for meal logs (no auth required for MVP)
CREATE POLICY "Anyone can view meal logs" 
ON public.meal_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create meal logs" 
ON public.meal_logs 
FOR INSERT 
WITH CHECK (true);

-- Insert sample Indian food nutrition data
INSERT INTO public.nutrition_items (name, keywords, serving_size_grams, calories, protein, carbs, fat) VALUES
('paneer tikka', ARRAY['paneer', 'tikka', 'cottage cheese', 'indian'], 100, 265, 18, 6, 20),
('butter chicken', ARRAY['butter', 'chicken', 'murgh makhani', 'indian'], 100, 190, 15, 8, 12),
('dal makhani', ARRAY['dal', 'lentils', 'black dal', 'indian'], 100, 120, 6, 15, 4),
('biryani', ARRAY['rice', 'biryani', 'indian', 'dum'], 100, 180, 5, 28, 6),
('naan', ARRAY['bread', 'naan', 'indian', 'flatbread'], 100, 310, 9, 50, 8),
('roti', ARRAY['bread', 'chapati', 'indian', 'wheat'], 100, 297, 10, 52, 5),
('samosa', ARRAY['samosa', 'snack', 'indian', 'fried'], 100, 262, 5, 28, 15),
('idli', ARRAY['idli', 'south indian', 'steamed', 'breakfast'], 100, 78, 2, 16, 0.4),
('dosa', ARRAY['dosa', 'south indian', 'crepe', 'breakfast'], 100, 133, 4, 20, 4),
('chole', ARRAY['chickpeas', 'chana', 'indian', 'curry'], 100, 160, 9, 27, 3),
('palak paneer', ARRAY['spinach', 'paneer', 'indian', 'saag'], 100, 180, 12, 8, 12),
('tandoori chicken', ARRAY['tandoori', 'chicken', 'grilled', 'indian'], 100, 150, 25, 4, 4),
('aloo paratha', ARRAY['paratha', 'potato', 'indian', 'breakfast'], 100, 220, 5, 32, 9),
('rice', ARRAY['white rice', 'chawal', 'steamed'], 100, 130, 2.7, 28, 0.3),
('chapati', ARRAY['roti', 'bread', 'wheat', 'indian'], 100, 240, 7, 50, 3),
('egg curry', ARRAY['egg', 'curry', 'indian', 'anda'], 100, 150, 10, 5, 10),
('fish curry', ARRAY['fish', 'curry', 'indian', 'seafood'], 100, 130, 18, 4, 5),
('rajma', ARRAY['kidney beans', 'rajma', 'indian', 'curry'], 100, 140, 8, 23, 1),
('khichdi', ARRAY['rice', 'dal', 'indian', 'comfort food'], 100, 100, 4, 18, 2),
('upma', ARRAY['semolina', 'breakfast', 'south indian'], 100, 130, 3, 22, 4);