-- Create carousel_images table for homepage carousel management
CREATE TABLE carousel_images (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,
    file_size BIGINT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster filtering by active status
CREATE INDEX idx_carousel_images_active ON carousel_images(is_active);

-- Add index for sorting by display order
CREATE INDEX idx_carousel_images_order ON carousel_images(display_order);
