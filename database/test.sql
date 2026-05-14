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