--USE master;
--GO

--DROP DATABASE IF EXISTS merit_swipe;
--GO

--CREATE DATABASE merit_swipe;

USE merit_swipe;
GO

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
)

-- this table will hold all the resturants information
CREATE TABLE resturants(
	id INT NOT NULL IDENTITY(1,1),
	peekaboo_entity_id INT NOT NULL,
	name NVARCHAR(150) NOT NULL,
    categoryId INT NULL,
	url_logo NVARCHAR(500) NULL,
	is_active BIT NOT NULL DEFAULT 1,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

	CONSTRAINT PK_resturants PRIMARY KEY(id),
	CONSTRAINT UQ_resturants_peekaboo_entity_id UNIQUE (peekaboo_entity_id)
)

-- this table will hold the food category informatrion like fastfood, desi food
CREATE TABLE categories(
	id INT NOT NULL IDENTITY(1,1),
	name NVARCHAR(50) NOT NULL,
	url_logo NVARCHAR(500) NOT NULL,
	created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
	udated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),	
)

