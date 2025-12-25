-- Insert sample users
INSERT INTO users (email, password_hash, name, phone) VALUES
('admin@digitalframes.com', '$2a$10$TKh8H1.0.HJqQ/wnC0IFLOeSVXBXVfDyOKhdKJMJB0WZV/3Vz0zSm', 'Admin User', '9876543210'),
('customer@example.com', '$2a$10$TKh8H1.0.HJqQ/wnC0IFLOeSVXBXVfDyOKhdKJMJB0WZV/3Vz0zSm', 'John Doe', '9876543211');

-- Passwords are: admin123 and customer123

-- Insert user roles
INSERT INTO user_roles (user_id, roles) VALUES
(1, 'ADMIN'),
(1, 'CUSTOMER'),
(2, 'CUSTOMER');

-- Insert sample products
INSERT INTO products (name, slug, description, specs_json, base_price, category, brand, rating, review_count) VALUES
('Premium 10-inch Digital Frame', 'premium-10-inch-digital-frame', 
 'High-resolution 10-inch digital photo frame with WiFi connectivity', 
 '{"display": "10-inch IPS", "resolution": "1920x1200", "storage": "16GB", "wifi": "Yes", "touchscreen": "Yes"}',
 12999, 'Digital Frames', 'FrameTech', 4.5, 125),
 
('Smart 15-inch Digital Display', 'smart-15-inch-digital-display',
 'Large 15-inch smart digital frame perfect for living rooms',
 '{"display": "15-inch LED", "resolution": "2560x1600", "storage": "32GB", "wifi": "Yes", "touchscreen": "Yes", "video": "4K support"}',
 24999, 'Digital Frames', 'FrameTech', 4.8, 89),

('Compact 8-inch Photo Frame', 'compact-8-inch-photo-frame',
 'Perfect bedside digital frame with ambient light sensor',
 '{"display": "8-inch LCD", "resolution": "1280x800", "storage": "8GB", "wifi": "Yes", "touchscreen": "No"}',
 7999, 'Digital Frames', 'PhotoView', 4.3, 201),

('Professional 21-inch Gallery Display', 'professional-21-inch-gallery-display',
 'Museum-quality digital art display for professionals',
 '{"display": "21-inch 4K OLED", "resolution": "3840x2160", "storage": "64GB", "wifi": "Yes", "touchscreen": "Yes", "HDR": "Yes"}',
 54999, 'Professional', 'ArtFrame Pro', 4.9, 45),

('WiFi Cloud Frame 12-inch', 'wifi-cloud-frame-12-inch',
 'Cloud-connected frame with unlimited photo storage',
 '{"display": "12-inch IPS", "resolution": "2048x1536", "storage": "Cloud + 16GB", "wifi": "Yes", "touchscreen": "Yes"}',
 16999, 'Digital Frames', 'CloudFrame', 4.6, 167);

-- Insert SKUs for products
INSERT INTO skus (product_id, sku_code, attributes_json, price, stock, image_url) VALUES
-- Premium 10-inch variants
(1, 'DF10-BLK-M', '{"size": "10-inch", "color": "Black", "finish": "Matte"}', 12999, 50, '/images/df10-black-matte.jpg'),
(1, 'DF10-WHT-M', '{"size": "10-inch", "color": "White", "finish": "Matte"}', 12999, 45, '/images/df10-white-matte.jpg'),
(1, 'DF10-BLK-G', '{"size": "10-inch", "color": "Black", "finish": "Glossy"}', 13999, 30, '/images/df10-black-glossy.jpg'),

-- Smart 15-inch variants
(2, 'DF15-BLK-M', '{"size": "15-inch", "color": "Black", "finish": "Matte"}', 24999, 25, '/images/df15-black-matte.jpg'),
(2, 'DF15-SLV-M', '{"size": "15-inch", "color": "Silver", "finish": "Matte"}', 25999, 20, '/images/df15-silver-matte.jpg'),

-- Compact 8-inch variants
(3, 'DF8-BLK-S', '{"size": "8-inch", "color": "Black", "finish": "Standard"}', 7999, 75, '/images/df8-black.jpg'),
(3, 'DF8-WHT-S', '{"size": "8-inch", "color": "White", "finish": "Standard"}', 7999, 80, '/images/df8-white.jpg'),
(3, 'DF8-WOD-S', '{"size": "8-inch", "color": "Wood", "finish": "Natural"}', 8999, 40, '/images/df8-wood.jpg'),

-- Professional 21-inch variants
(4, 'DF21-PRO-BLK', '{"size": "21-inch", "color": "Black", "finish": "Professional"}', 54999, 10, '/images/df21-pro-black.jpg'),
(4, 'DF21-PRO-WHT', '{"size": "21-inch", "color": "White", "finish": "Professional"}', 54999, 8, '/images/df21-pro-white.jpg'),

-- WiFi Cloud Frame 12-inch variants
(5, 'DF12-CLD-BLK', '{"size": "12-inch", "color": "Black", "finish": "Premium"}', 16999, 35, '/images/df12-cloud-black.jpg'),
(5, 'DF12-CLD-WHT', '{"size": "12-inch", "color": "White", "finish": "Premium"}', 16999, 40, '/images/df12-cloud-white.jpg');

-- Insert sample addresses
INSERT INTO addresses (user_id, line1, line2, city, state, pincode, is_default) VALUES
(2, '123 Main Street', 'Apartment 4B', 'Mumbai', 'Maharashtra', '400001', true),
(2, '456 Park Avenue', 'Suite 100', 'Delhi', 'Delhi', '110001', false);

-- Insert sample coupons
INSERT INTO coupons (code, type, value, min_amount, valid_from, valid_to) VALUES
('WELCOME10', 'PERCENT', 10, 1000, '2024-01-01', '2024-12-31'),
('FLAT500', 'FLAT', 500, 5000, '2024-01-01', '2024-12-31'),
('PREMIUM20', 'PERCENT', 20, 20000, '2024-01-01', '2024-12-31');

-- Insert sample banners
INSERT INTO banners (title, image_url, link_url, sort_order) VALUES
('New Year Sale - Up to 30% Off', '/banners/new-year-sale.jpg', '/digital-frames?sale=newyear', 1),
('Premium Collection Launch', '/banners/premium-collection.jpg', '/digital-frames?category=premium', 2),
('Free Shipping on Orders Above ₹10,000', '/banners/free-shipping.jpg', '/shipping-info', 3);