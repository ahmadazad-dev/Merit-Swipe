USE merit_swipe;
GO

SELECT * FROM banks
SELECT * FROM restaurants
SELECT * FROM branches
SELECT * FROM cards
SELECT * FROM deals
SELECT * FROM deal_branches
SELECT * FROM deal_cards
SELECT * FROM sync_logs

SELECT COUNT(*) AS Number_Of_Banks FROM banks 
SELECT COUNT(*) AS Number_Of_Restaurants FROM restaurants 
SELECT COUNT(*) AS Number_Of_Branches FROM branches 
SELECT COUNT(*) AS Number_Of_Cards FROM cards 
SELECT COUNT(*) AS Number_Of_Deals FROM deals 
SELECT COUNT(*) AS Number_Of_Deal_Branches FROM deal_branches 
SELECT COUNT(*) AS Number_Of_Deal_Cards FROM deal_cards 
SELECT COUNT(*) AS Number_Of_Sync_logs FROM sync_logs 

--DELETE FROM sync_logs
--DELETE FROM deal_cards
--DELETE FROM deal_branches
--DELETE FROM deals
--DELETE FROM cards
--DELETE FROM branches
--DELETE FROM restaurants
--DELETE FROM banks

SELECT * FROM deals WHERE peekaboo_deal_id = 141046
SELECT * FROM deals WHERE peekaboo_deal_id = 141061
SELECT * FROM cards WHERE bank_id = 74
SELECT 
	deal_id,
	COUNT(1) AS NumberOfBranches
FROM deal_branches
GROUP BY deal_id

SELECT DISTINCT
	deal_id
FROM deal_branches



-- notif testing
SELECT TOP 50
  id, user_id, title, message, is_read, created_at
FROM notifications
ORDER BY created_at DESC;

SELECT TOP 20
  id, status, error_message, completed_at
FROM sync_logs
ORDER BY completed_at DESC;

select * from users;


INSERT INTO notifications (user_id, deal_id, title, message, is_read)
VALUES (NULL, NULL, 'notif test', 'This is a test message for all', 0);

INSERT INTO notifications (user_id, deal_id, title, message, is_read)
VALUES (1, 23, 'user 1 notif test', 'This is a test message only for ahmed', 0);

INSERT INTO notifications (user_id, deal_id, title, message, is_read)
VALUES (2, 23, 'user 2 notif test', 'This is a test message only for muiz', 0);



select * from notifications;

SELECT TOP 10 id, title, message, is_read, created_at
FROM notifications
ORDER BY created_at DESC;

truncate table notifications;

-- needed to drop constraint to allow null values in user_id column of notifications table
SELECT COLUMN_NAME, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'user_id';

ALTER TABLE notifications
ALTER COLUMN user_id INT NULL;

SELECT name
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('notifications');

ALTER TABLE notifications DROP CONSTRAINT FK_notifications_user;

ALTER TABLE notifications
ALTER COLUMN user_id INT NULL;

ALTER TABLE notifications
ADD CONSTRAINT FK_notifications_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;


SELECT TOP 10 id, user_id, is_read, created_at
FROM notifications
ORDER BY created_at DESC;

ALTER TABLE notifications ALTER COLUMN user_id INT NULL;
SELECT name
FROM sys.check_constraints
WHERE parent_object_id = OBJECT_ID('notifications');

select * from notifications where user_id is null;

SELECT * FROM VW_deal_information 
SELECT * FROM restaurants  
SELECT DISTINCT category FROM restaurants WHERE category IS NOT NULL ORDER BY category

select * from VW_deal_information 
select * from users
select * from cards

SELECT DISTINCT category 
FROM VW_deal_information 
WHERE category IS NOT NULL 
ORDER BY category;

USE merit_swipe;
GO

-- 1. Insert all categories so they exist in the DB
INSERT INTO categories (name, slug)
SELECT name, slug 
FROM (
    VALUES 
        ('Salary', 'salary'), 
        ('Profit / Refunds', 'profit_income'),
        ('Dining & Restaurants', 'fast_food'),
        ('Transport', 'transport'),
        ('Fuel', 'fuel'),
        ('Groceries', 'groceries'),
        ('Clothing', 'clothing'),
        ('Health', 'health'),
        ('Utilities', 'utilities'),
        ('ATM Withdrawal', 'atm_withdrawal'),
        ('Bank Charges', 'bank_charges'),
        ('Transfer Out', 'transfer_out'),
        ('Transfer In', 'transfer_in'),
        ('Other', 'other')
) AS new_cats(name, slug)
WHERE NOT EXISTS (
    -- Only insert if the slug doesn't already exist in the table
    SELECT 1 FROM categories c WHERE c.slug = new_cats.slug
);
GO

-- 2. Add the category_id column back to restaurants
ALTER TABLE restaurants ADD category_id INT;
GO

-- 3. Safely migrate existing text categories to their proper IDs
UPDATE r
SET r.category_id = c.id
FROM restaurants r
JOIN categories c ON r.category = c.name;
GO

-- 4. Restore the Foreign Key and Index
ALTER TABLE restaurants ADD CONSTRAINT FK_restaurants_category FOREIGN KEY (category_id) REFERENCES categories(id);
CREATE INDEX IX_restaurants_category_id ON restaurants (category_id);
GO

-- 5. Drop the old raw text column safely
ALTER TABLE restaurants DROP COLUMN category;
GO

-- 6. Update the View so app.js continues to work perfectly!
CREATE OR ALTER VIEW VW_deal_information AS
SELECT 
    d.id AS deal_id, d.peekaboo_deal_id, d.restaurant_id, d.bank_id,
    d.title AS deal_title, d.description AS deal_description, d.discount_type,
    d.percentage_value, d.flat_value, d.cap_amount, d.campaign_tag,
    d.valid_outlet, d.valid_delivery, d.valid_takeaway, d.is_active, d.is_featured,
    d.start_date, d.end_date, d.created_at, d.updated_at,
    r.name AS restaurant_name, r.url_logo AS restaurant_url_logo,
    c.name AS category, -- Pulls the clean name from the categories table
    b.name AS bank_name
FROM deals d
JOIN restaurants r ON d.restaurant_id = r.id
JOIN banks b ON d.bank_id = b.id
LEFT JOIN categories c ON r.category_id = c.id;
GO