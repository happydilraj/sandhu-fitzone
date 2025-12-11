-- Seed initial data for FutureFit Gym

-- Insert admin user (password: admin123)
-- Password hash generated with bcrypt, 12 rounds
INSERT INTO users (full_name, email, password_hash, phone, role, is_active)
VALUES (
  'Admin User',
  'admin@futurefit.com',
  '$2b$12$/yfGOzeot94Fbu1VVAikNOpIZfarOggbJJi56RyhYYkHFNcQ3S3VS',
  '9999999999',
  'ADMIN',
  true
) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Insert membership plans
INSERT INTO membership_plans (name, price, duration_days, features, is_active) VALUES
('Basic', 799, 30, '["Access to gym floor", "Locker facility", "Basic equipment access", "Morning/Evening batch"]', true),
('Pro', 1499, 30, '["All Basic features", "Access to all equipment", "Steam & sauna", "Flexible timings", "1 PT session/month"]', true),
('Elite', 2499, 30, '["All Pro features", "Unlimited PT sessions", "Diet consultation", "Priority booking", "Guest passes (2/month)", "Merchandise discount"]', true)
ON CONFLICT DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (name, category, description, image_url) VALUES
('Treadmill Pro X500', 'cardio', 'Commercial grade treadmill with incline up to 15%, speed up to 20 km/h', '/placeholder.svg?height=300&width=400'),
('Elliptical Trainer', 'cardio', 'Low impact cardio machine with adjustable resistance levels', '/placeholder.svg?height=300&width=400'),
('Stationary Bike', 'cardio', 'Spin bike with magnetic resistance and digital display', '/placeholder.svg?height=300&width=400'),
('Bench Press Station', 'strength', 'Olympic bench press with safety catches and adjustable rack', '/placeholder.svg?height=300&width=400'),
('Squat Rack', 'strength', 'Heavy duty power rack with pull-up bar and safety arms', '/placeholder.svg?height=300&width=400'),
('Lat Pulldown Machine', 'strength', 'Cable machine for back exercises with multiple grip attachments', '/placeholder.svg?height=300&width=400'),
('Dumbbell Set', 'free-weights', 'Complete set from 2.5kg to 50kg with rack', '/placeholder.svg?height=300&width=400'),
('Barbell Set', 'free-weights', 'Olympic barbell with weight plates from 1.25kg to 25kg', '/placeholder.svg?height=300&width=400'),
('Kettlebells', 'free-weights', 'Cast iron kettlebells from 4kg to 32kg', '/placeholder.svg?height=300&width=400'),
('Cable Crossover', 'functional', 'Dual adjustable pulley system for functional training', '/placeholder.svg?height=300&width=400'),
('Battle Ropes', 'functional', '15m heavy duty battle ropes for HIIT training', '/placeholder.svg?height=300&width=400'),
('TRX Suspension', 'functional', 'Suspension training system for bodyweight exercises', '/placeholder.svg?height=300&width=400')
ON CONFLICT DO NOTHING;

-- Insert sample gallery images
INSERT INTO gallery_images (title, caption, image_url) VALUES
('Main Gym Floor', 'Our spacious 5000 sq ft workout area', '/placeholder.svg?height=400&width=600'),
('Cardio Zone', 'State-of-the-art cardio equipment', '/placeholder.svg?height=400&width=600'),
('Free Weights Area', 'Complete free weights section', '/placeholder.svg?height=400&width=600'),
('Personal Training', 'One-on-one sessions with expert trainers', '/placeholder.svg?height=400&width=600'),
('Group Classes', 'Energetic group workout sessions', '/placeholder.svg?height=400&width=600'),
('Locker Room', 'Clean and modern locker facilities', '/placeholder.svg?height=400&width=600')
ON CONFLICT DO NOTHING;
