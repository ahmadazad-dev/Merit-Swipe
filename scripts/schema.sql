--USE master;
--GO

--DROP DATABASE IF EXISTS merit_swipe;
--GO

--CREATE DATABASE merit_swipe;

USE merit_swipe;
GO

DROP TABLE IF EXISTS banks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS deal_cards;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS user_cards;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS sync_logs;
DROP TABLE IF EXISTS merchant_mappings;

-- this table will hold all the banks information
CREATE TABLE banks(
	id INT NOT NULL IDENTITY(1,1),
	peekaboo_entity_id INT NOT NULL,
	peekaboo_original_id INT NULL,
	name NVARCHAR(150) NOT NULL,
	description NVARCHAR(MAX) NULL,
	contact NVARCHAR(50) NULL,
	url_logo NVARCHAR(500) NULL,
	is_active BIT NOT NULL DEFAULT 1,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_banks PRIMARY KEY (id),
	CONSTRAINT UQ_banks_peekaboo_entity_id UNIQUE (peekaboo_entity_id)
);
GO

-- this table will hold the food category informatrion like fastfood, desi food
CREATE TABLE categories(
	id INT NOT NULL IDENTITY(1,1),
	name NVARCHAR(50) NOT NULL,
	url_logo NVARCHAR(500) NOT NULL,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_categories PRIMARY KEY (id)
);
GO


-- this table will hold all the restaurants information
CREATE TABLE restaurants(
	id INT NOT NULL IDENTITY(1,1),
	peekaboo_entity_id INT NOT NULL,
	name NVARCHAR(150) NOT NULL,
    category_id INT NULL,
	url_logo NVARCHAR(500) NULL,
	is_active BIT NOT NULL DEFAULT 1,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_restaurants PRIMARY KEY(id),
	CONSTRAINT UQ_restaurants_peekaboo_entity_id UNIQUE (peekaboo_entity_id),
	CONSTRAINT FK_resturent_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
GO

-- this will store the information of the branches where the deals will be available
CREATE TABLE branches (
	id INT IDENTITY(1,1) NOT NULL,
	resturant_id INT NOT NULL,
	peekaboo_branch_id INT NOT NULL,
	title NVARCHAR(200) NOT NULL,
	city NVARCHAR(50) NULL,

	is_active BIT NOT NULL DEFAULT 1,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_branches PRIMARY KEY(id),
	CONSTRAINT UQ_branches_peekaboo_branch_id UNIQUE (peekaboo_branch_id),
	CONSTRAINT FK_branches_resturant_id FOREIGN KEY (resturant_id) REFERENCES restaurants(id)
);
GO

-- this will store the deal information
CREATE TABLE deals(
	id INT IDENTITY(1,1) NOT NULL,
	peekaboo_deal_id INT,
	resturant_id INT NOT NULL,
	bank_id INT NOT NULL,
	title NVARCHAR(200) NOT NULL,
	description NVARCHAR(MAX) NULL,
	percentage_value DECIMAL(10,2) NOT NULL,
	start_date DATETIME2 NOT NULL,
	end_date DATETIME2 NOT NULL,
	is_active BIT NOT NULL DEFAULT 1,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_deals PRIMARY KEY (id),
	CONSTRAINT FK_deals_resturant_id FOREIGN KEY (resturant_id) REFERENCES restaurants(id),
	CONSTRAINT FK_deals_bank_id FOREIGN KEY (bank_id) REFERENCES banks(id)
);
GO

-- this will store the cards information
CREATE TABLE cards(
	id INT IDENTITY(1,1) NOT NULL,
	peekaboo_card_id INT NOT NULL,
	peekaboo_entity_association_id INT NOT NULL,
	name VARCHAR(100) NOT NULL,
	bank_id INT NOT NULL,
	logo_url NVARCHAR(500),
	is_active BIT NOT NULL DEFAULT 1,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	
	CONSTRAINT PK_cards PRIMARY KEY (id),
	CONSTRAINT FK_cards_bank_id FOREIGN KEY (bank_id) REFERENCES banks(id)
);
GO

-- this is a link between the card and the deals
CREATE TABLE deal_cards(
	id INT IDENTITY(1,1) NOT NULL,
	deal_id INT NOT NULL,
	card_id INT NOT NULL,

	CONSTRAINT PK_deal_cards PRIMARY KEY (id),
	CONSTRAINT FK_deal_cards_deal_id FOREIGN KEY (deal_id) REFERENCES deals(id),
	CONSTRAINT FK_deal_cards_card_id FOREIGN KEY (card_id) REFERENCES cards(id)
);
GO

-- it will contain user data
CREATE TABLE users (
	id INT IDENTITY NOT NULL,
	first_name NVARCHAR(50) NOT NULL,
	last_name NVARCHAR(50) NULL,
	email NVARCHAR(100) NOT NULL,
	password_hash NVARCHAR(255) NOT NULL,
	is_deleted BIT NOT NULL DEFAULT 0,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_users PRIMARY KEY (id),
	CONSTRAINT UQ_user_email UNIQUE (email)
);
GO

-- it will contain user profile data
CREATE TABLE profiles (
	id INT IDENTITY NOT NULL,
	user_id INT NOT NULL,
	avatar_url NVARCHAR(500) NULL,
	city NVARCHAR(100) NULL,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_profiles PRIMARY KEY (id),
	CONSTRAINT FK_profile_user_id FOREIGN KEY (user_id) REFERENCES users(id),
	CONSTRAINT UQ_profile_user_id UNIQUE (user_id)
);
GO

-- it will map user with his cards
CREATE TABLE user_cards (
	id INT NOT NULL IDENTITY(1,1),
    user_id INT NOT NULL,
    card_id INT NOT NULL,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_User_Cards PRIMARY KEY (id),
    CONSTRAINT UQ_User_Cards_UserCard UNIQUE (user_id, card_id),
    CONSTRAINT FK_User_Cards_User FOREIGN KEY (user_id) REFERENCES Users (Id),
    CONSTRAINT FK_User_Cards_Card FOREIGN KEY (card_id) REFERENCES Cards (Id)
);
GO

-- it will record the transactins
CREATE TABLE transactions(
    id INT NOT NULL IDENTITY(1,1),
    user_id INT NOT NULL,
    resturant_id INT NULL,
    category_id INT NULL,
    MerchantNameRaw NVARCHAR(300) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currenty NVARCHAR(10) NOT NULL DEFAULT 'PKR',
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_transactions PRIMARY KEY (id),
    CONSTRAINT FK_transactions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_transactions_rest FOREIGN KEY (resturant_id) REFERENCES restaurants(id),
    CONSTRAINT FK_transactions_cat FOREIGN KEY (category_id) REFERENCES categories(id)
);
GO

-- it will store the preferences of the user
CREATE TABLE user_preferences(
    id INT NOT NULL IDENTITY(1,1),
    user_id INT NOT NULL,
    category_id INT NULL,
    restaurant_id INT NULL,
    notify_new_deals BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_user_preferences PRIMARY KEY (id),
    CONSTRAINT FK_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_user_preferences_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT FK_user_preferences_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT CHK_user_preferences_oneof CHECK(
        (category_id IS NOT NULL AND restaurant_id IS NULL)
        OR
        (category_id IS NULL AND restaurant_id IS NOT NULL)
    )
);
GO

-- general notifications of the user
CREATE TABLE notifications(
    id INT NOT NULL IDENTITY(1,1),
    user_id INT NOT NULL,
    deal_id INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    message NVARCHAR(500) NOT NULL,
    is_read BIT NOT NULL DEFAULT 0,
    sent_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT PK_notifications PRIMARY KEY (id),
    CONSTRAINT FK_notifications_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_notifications_deal FOREIGN KEY (deal_id) REFERENCES deals(id)
);
GO

-- it is the general table which will store all information related the new data and the already present data
CREATE TABLE sync_logs(
    id INT NOT NULL IDENTITY(1,1),
    triggered_by NVARCHAR(20) NOT NULL,
    sync_type NVARCHAR(20) NOT NULL,
    target_restaurant_id INT NULL,
    target_bank_id INT NULL,
    api_endpoint NVARCHAR(500) NULL,
    http_status_code INT NULL,
    deals_fetched INT NOT NULL DEFAULT 0,
    deals_inserted INT NOT NULL DEFAULT 0,
    deals_updated INT NOT NULL DEFAULT 0,
    deals_expired INT NOT NULL DEFAULT 0,
    status NVARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    error_message NVARCHAR(MAX) NULL,
    started_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    completed_at DATETIME2 NULL,

    CONSTRAINT PK_sync_logs PRIMARY KEY (id),
    CONSTRAINT FK_sync_logs_restaurant FOREIGN KEY (target_restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT FK_sync_logs_bank FOREIGN KEY (target_bank_id) REFERENCES banks(id),
    CONSTRAINT CHK_sync_logs_triggered_by CHECK (triggered_by IN ('SCHEDULED', 'MANUAL')),
    CONSTRAINT CHK_sync_logs_sync_type CHECK (sync_type IN ('FULL', 'PARTIAL')),
    CONSTRAINT CHK_sync_logs_status CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL'))
);
GO

-- 
CREATE TABLE merchant_mappings(
    id INT NOT NULL IDENTITY(1,1),
    from_restaurant_id INT NOT NULL,
    to_restaurant_id INT NOT NULL,
    category_id INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT pk_merchant_mappings PRIMARY KEY (id),
    CONSTRAINT uq_merchant_mappings_pair UNIQUE (from_restaurant_id, to_restaurant_id),
    CONSTRAINT fk_merchant_mappings_from_restaurant FOREIGN KEY (from_restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT fk_merchant_mappings_to_restaurant FOREIGN KEY (to_restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT fk_merchant_mappings_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT chk_merchant_mappings_not_self CHECK (from_restaurant_id <> to_restaurant_id)
);
GO