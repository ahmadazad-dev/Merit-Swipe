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

SELECT COUNT(*) FROM banks
SELECT COUNT(*) FROM restaurants
SELECT COUNT(*) FROM branches
SELECT COUNT(*) FROM cards
SELECT COUNT(*) FROM deals
SELECT COUNT(*) FROM deal_branches
SELECT COUNT(*) FROM deal_cards
SELECT COUNT(*) FROM sync_logs

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