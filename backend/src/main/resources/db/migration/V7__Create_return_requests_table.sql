-- Create return_requests table
CREATE TABLE IF NOT EXISTS return_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    return_id VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    reason VARCHAR(50) NOT NULL,
    reason_details TEXT,
    product_id BIGINT,
    product_name VARCHAR(500),
    quantity INT DEFAULT 1,
    refund_amount DECIMAL(10, 2),
    admin_notes TEXT,
    pickup_address TEXT,
    pickup_scheduled_date DATETIME,
    refund_transaction_id VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at DATETIME,

    INDEX idx_return_id (return_id),
    INDEX idx_order_id (order_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),

    CONSTRAINT fk_return_order FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE CASCADE
);
