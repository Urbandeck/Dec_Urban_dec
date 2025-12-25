-- Add isLive column to products table for managing product visibility
ALTER TABLE products
ADD COLUMN is_live BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Product visibility status - true for live, false for draft';

-- Set existing products to live by default
UPDATE products SET is_live = TRUE WHERE active = TRUE;

-- Add index for faster filtering by live status
CREATE INDEX idx_products_is_live ON products(is_live);