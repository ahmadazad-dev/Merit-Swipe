--USE master;
--GO

--DROP DATABASE IF EXISTS merit_swipe;
--GO

--CREATE DATABASE merit_swipe;
--GO

USE merit_swipe;
GO

-- =============================================================================
-- SECTION 1: REFERENCE TABLES
-- =============================================================================

CREATE TABLE categories (
    id              INT             NOT NULL IDENTITY(1,1),
    name            NVARCHAR(100)   NOT NULL,
    slug            NVARCHAR(100)   NOT NULL,
    url_logo        NVARCHAR(500)   NULL,
    display_order   SMALLINT        NOT NULL DEFAULT 0,
    is_active       BIT             NOT NULL DEFAULT 1,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_categories        PRIMARY KEY (id),
    CONSTRAINT UQ_categories_name   UNIQUE (name),
    CONSTRAINT UQ_categories_slug   UNIQUE (slug)
);
GO

CREATE TABLE banks (
    id                      INT             NOT NULL IDENTITY(1,1),
    peekaboo_entity_id      INT             NOT NULL,
    peekaboo_original_id    INT             NULL,
    name                    NVARCHAR(150)   NOT NULL,
    slug                    NVARCHAR(150)   NOT NULL,
    description             NVARCHAR(MAX)   NULL,
    contact_number          NVARCHAR(50)    NULL,
    url_logo                NVARCHAR(500)   NULL,
    website_url             NVARCHAR(500)   NULL,
    is_active               BIT             NOT NULL DEFAULT 1,
    created_at              DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at              DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_banks                     PRIMARY KEY (id),
    CONSTRAINT UQ_banks_peekaboo_entity_id  UNIQUE (peekaboo_entity_id),
    CONSTRAINT UQ_banks_slug                UNIQUE (slug)
);
GO

CREATE TABLE restaurants (
    id                  INT             NOT NULL IDENTITY(1,1),
    peekaboo_entity_id  INT             NOT NULL,
    name                NVARCHAR(150)   NOT NULL,
    slug                NVARCHAR(150)   NOT NULL,
    category_id         INT             NULL,
    url_logo            NVARCHAR(500)   NULL,
    is_active           BIT             NOT NULL DEFAULT 1,
    created_at          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_restaurants                    PRIMARY KEY (id),
    CONSTRAINT UQ_restaurants_peekaboo_entity_id UNIQUE (peekaboo_entity_id),
    CONSTRAINT UQ_restaurants_slug               UNIQUE (slug),
    CONSTRAINT FK_restaurants_category           FOREIGN KEY (category_id)
                                                     REFERENCES categories (id)
);
GO

CREATE INDEX IX_restaurants_category_id ON restaurants (category_id);
CREATE INDEX IX_restaurants_is_active   ON restaurants (is_active);
GO

CREATE TABLE branches (
    id                  INT             NOT NULL IDENTITY(1,1),
    restaurant_id       INT             NOT NULL,
    peekaboo_branch_id  INT             NOT NULL,
    title               NVARCHAR(200)   NOT NULL,
    city                NVARCHAR(100)   NULL,
    address             NVARCHAR(500)   NULL,
    latitude            DECIMAL(9,6)    NULL,
    longitude           DECIMAL(9,6)    NULL,
    is_active           BIT             NOT NULL DEFAULT 1,
    created_at          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_branches                  PRIMARY KEY (id),
    CONSTRAINT UQ_branches_peekaboo_branch_id UNIQUE (peekaboo_branch_id),
    CONSTRAINT FK_branches_restaurant       FOREIGN KEY (restaurant_id)
                                                REFERENCES restaurants (id)
);
GO

CREATE INDEX IX_branches_restaurant_id ON branches (restaurant_id);
CREATE INDEX IX_branches_city          ON branches (city);
GO

CREATE TABLE cards (
    id                      INT             NOT NULL IDENTITY(1,1),
    bank_id                 INT             NOT NULL,
    peekaboo_card_type_id   INT             NOT NULL,
    peekaboo_association_id INT             NOT NULL,
    name                    NVARCHAR(200)   NOT NULL,
    card_network            NVARCHAR(20)    NULL,
    card_tier               NVARCHAR(50)    NULL,
    card_type               NVARCHAR(20)    NULL,
    url_logo                NVARCHAR(500)   NULL,
    is_active               BIT             NOT NULL DEFAULT 1,
    created_at              DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at              DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_cards                         PRIMARY KEY (id),
    CONSTRAINT UQ_cards_peekaboo_association_id UNIQUE (peekaboo_association_id),
    CONSTRAINT FK_cards_bank                    FOREIGN KEY (bank_id)
                                                    REFERENCES banks (id),
    CONSTRAINT CHK_cards_network CHECK (
        card_network IN ('VISA','MASTERCARD','UNIONPAY','AMEX','OTHER')
        OR card_network IS NULL
    ),
    CONSTRAINT CHK_cards_type CHECK (
        card_type IN ('DEBIT','CREDIT','PREPAID')
        OR card_type IS NULL
    )
);
GO

CREATE INDEX IX_cards_bank_id      ON cards (bank_id);
CREATE INDEX IX_cards_card_type    ON cards (card_type);
CREATE INDEX IX_cards_card_network ON cards (card_network);
GO

-- =============================================================================
-- SECTION 2: DEALS AND ELIGIBILITY
-- =============================================================================

CREATE TABLE deals (
    id               INT             NOT NULL IDENTITY(1,1),
    peekaboo_deal_id INT             NULL,
    restaurant_id    INT             NOT NULL,
    bank_id          INT             NOT NULL,
    title            NVARCHAR(200)   NOT NULL,
    description      NVARCHAR(MAX)   NULL,
    discount_type    NVARCHAR(20)    NOT NULL DEFAULT 'PERCENTAGE',
    percentage_value DECIMAL(5,2)    NULL,
    flat_value       DECIMAL(12,2)   NULL,
    cap_amount       DECIMAL(12,2)   NULL,
    campaign_tag     NVARCHAR(200)   NULL,
    valid_outlet     BIT             NOT NULL DEFAULT 1,
    valid_delivery   BIT             NOT NULL DEFAULT 0,
    valid_takeaway   BIT             NOT NULL DEFAULT 0,
    start_date       DATETIME2       NOT NULL,
    end_date         DATETIME2       NOT NULL,
    is_active        BIT             NOT NULL DEFAULT 1,
    is_featured      BIT             NOT NULL DEFAULT 0,
    created_at       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_deals                   PRIMARY KEY (id),
    CONSTRAINT FK_deals_restaurant        FOREIGN KEY (restaurant_id)
                                              REFERENCES restaurants (id),
    CONSTRAINT FK_deals_bank              FOREIGN KEY (bank_id)
                                              REFERENCES banks (id),
    CONSTRAINT CHK_deals_discount_type    CHECK (discount_type IN ('PERCENTAGE','FLAT','BOGO','FREE_ITEM')),
    CONSTRAINT CHK_deals_date_order       CHECK (end_date > start_date),
    CONSTRAINT CHK_deals_percentage_range CHECK (
        percentage_value IS NULL
        OR (percentage_value > 0 AND percentage_value <= 100)
    ),
    CONSTRAINT CHK_deals_cap_positive     CHECK (cap_amount IS NULL OR cap_amount > 0)
);
GO

CREATE INDEX IX_deals_restaurant_id ON deals (restaurant_id);
CREATE INDEX IX_deals_bank_id       ON deals (bank_id);
CREATE INDEX IX_deals_is_active     ON deals (is_active);
CREATE INDEX IX_deals_end_date      ON deals (end_date);
CREATE INDEX IX_deals_campaign_tag  ON deals (campaign_tag);
CREATE INDEX IX_deals_active_window ON deals (is_active, end_date, start_date)
    INCLUDE (restaurant_id, bank_id, percentage_value, title);
GO

CREATE TABLE deal_cards (
    id      INT NOT NULL IDENTITY(1,1),
    deal_id INT NOT NULL,
    card_id INT NOT NULL,

    CONSTRAINT PK_deal_cards      PRIMARY KEY (id),
    CONSTRAINT UQ_deal_cards_pair UNIQUE (deal_id, card_id),
    CONSTRAINT FK_deal_cards_deal FOREIGN KEY (deal_id)
                                      REFERENCES deals (id) ON DELETE CASCADE,
    CONSTRAINT FK_deal_cards_card FOREIGN KEY (card_id)
                                      REFERENCES cards (id)
);
GO

CREATE INDEX IX_deal_cards_deal_id ON deal_cards (deal_id);
CREATE INDEX IX_deal_cards_card_id ON deal_cards (card_id);
GO

CREATE TABLE deal_branches (
    id        INT NOT NULL IDENTITY(1,1),
    deal_id   INT NOT NULL,
    branch_id INT NOT NULL,

    CONSTRAINT PK_deal_branches        PRIMARY KEY (id),
    CONSTRAINT UQ_deal_branches_pair   UNIQUE (deal_id, branch_id),
    CONSTRAINT FK_deal_branches_deal   FOREIGN KEY (deal_id)
                                           REFERENCES deals (id) ON DELETE CASCADE,
    CONSTRAINT FK_deal_branches_branch FOREIGN KEY (branch_id)
                                           REFERENCES branches (id)
);
GO

CREATE INDEX IX_deal_branches_deal_id   ON deal_branches (deal_id);
CREATE INDEX IX_deal_branches_branch_id ON deal_branches (branch_id);
GO

-- =============================================================================
-- SECTION 3: USER TABLES
-- =============================================================================

CREATE TABLE users (
    id                    INT              NOT NULL IDENTITY(1,1),
    public_uuid           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    first_name            NVARCHAR(100)    NOT NULL,
    last_name             NVARCHAR(100)    NULL,
    email                 NVARCHAR(255)    NOT NULL,
    password_hash         NVARCHAR(512)    NOT NULL,
    email_verified_at     DATETIME2        NULL,
    last_login_at         DATETIME2        NULL,
    failed_login_attempts SMALLINT         NOT NULL DEFAULT 0,
    locked_until          DATETIME2        NULL,
    is_deleted            BIT              NOT NULL DEFAULT 0,
    deleted_at            DATETIME2        NULL,
    created_at            DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at            DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_users             PRIMARY KEY (id),
    CONSTRAINT UQ_users_public_uuid UNIQUE (public_uuid),
    CONSTRAINT UQ_users_email       UNIQUE (email),
    CONSTRAINT CHK_users_delete_consistency CHECK (
        (is_deleted = 0 AND deleted_at IS NULL)
        OR (is_deleted = 1 AND deleted_at IS NOT NULL)
    )
);
GO

CREATE INDEX IX_users_email       ON users (email)       WHERE is_deleted = 0;
CREATE INDEX IX_users_public_uuid ON users (public_uuid) WHERE is_deleted = 0;
GO

CREATE TABLE profiles (
    id         INT           NOT NULL IDENTITY(1,1),
    user_id    INT           NOT NULL,
    avatar_url NVARCHAR(500) NULL,
    city       NVARCHAR(100) NULL,
    bio        NVARCHAR(500) NULL,
    created_at DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_profiles         PRIMARY KEY (id),
    CONSTRAINT UQ_profiles_user_id UNIQUE (user_id),
    CONSTRAINT FK_profiles_user    FOREIGN KEY (user_id)
                                       REFERENCES users (id)
);
GO

CREATE TABLE user_sessions (
    id          INT             NOT NULL IDENTITY(1,1),
    user_id     INT             NOT NULL,
    token_hash  NVARCHAR(512)   NOT NULL,
    device_info NVARCHAR(200)   NULL,
    ip_address  NVARCHAR(45)    NULL,
    expires_at  DATETIME2       NOT NULL,
    revoked_at  DATETIME2       NULL,
    created_at  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_user_sessions      PRIMARY KEY (id),
    CONSTRAINT FK_user_sessions_user FOREIGN KEY (user_id)
                                         REFERENCES users (id)
);
GO

CREATE INDEX IX_user_sessions_user_id      ON user_sessions (user_id);
CREATE INDEX IX_user_sessions_token_hash   ON user_sessions (token_hash);
CREATE INDEX IX_user_sessions_expires_at   ON user_sessions (expires_at) WHERE revoked_at IS NULL;
GO

CREATE TABLE user_cards (
    id         INT       NOT NULL IDENTITY(1,1),
    user_id    INT       NOT NULL,
    card_id    INT       NOT NULL,
    added_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    removed_at DATETIME2 NULL,

    CONSTRAINT PK_user_cards        PRIMARY KEY (id),
    CONSTRAINT UQ_user_cards_active UNIQUE (user_id, card_id),
    CONSTRAINT FK_user_cards_user   FOREIGN KEY (user_id)
                                        REFERENCES users (id),
    CONSTRAINT FK_user_cards_card   FOREIGN KEY (card_id)
                                        REFERENCES cards (id)
);
GO

CREATE INDEX IX_user_cards_user_id ON user_cards (user_id) WHERE removed_at IS NULL;
CREATE INDEX IX_user_cards_card_id ON user_cards (card_id);
GO

-- =============================================================================
-- SECTION 4: TRANSACTION TABLES
-- =============================================================================

CREATE TABLE transaction_imports (
    id                 INT           NOT NULL IDENTITY(1,1),
    user_id            INT           NOT NULL,
    original_filename  NVARCHAR(255) NOT NULL,
    file_size_bytes    INT           NOT NULL,
    row_count_total    INT           NULL,
    row_count_imported INT           NULL,
    row_count_failed   INT           NULL,
    status             NVARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    error_summary      NVARCHAR(MAX) NULL,
    imported_at        DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    completed_at       DATETIME2     NULL,

    CONSTRAINT PK_transaction_imports         PRIMARY KEY (id),
    CONSTRAINT FK_transaction_imports_user    FOREIGN KEY (user_id)
                                                  REFERENCES users (id),
    CONSTRAINT CHK_transaction_imports_status CHECK (
        status IN ('PENDING','PROCESSING','COMPLETED','FAILED','PARTIAL')
    )
);
GO

CREATE INDEX IX_transaction_imports_user_id ON transaction_imports (user_id);
GO

CREATE TABLE transactions (
    id                INT           NOT NULL IDENTITY(1,1),
    user_id           INT           NOT NULL,
    import_id         INT           NULL,
    merchant_name_raw NVARCHAR(300) NOT NULL,
    restaurant_id     INT           NULL,
    category_id       INT           NULL,
    match_confidence  DECIMAL(4,3)  NULL,
    amount            DECIMAL(14,2) NOT NULL,
    currency          NVARCHAR(10)  NOT NULL DEFAULT 'PKR',
    transaction_date  DATE          NOT NULL,
    notes             NVARCHAR(500) NULL,
    created_at        DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_transactions             PRIMARY KEY (id),
    CONSTRAINT FK_transactions_user        FOREIGN KEY (user_id)
                                               REFERENCES users (id),
    CONSTRAINT FK_transactions_import      FOREIGN KEY (import_id)
                                               REFERENCES transaction_imports (id),
    CONSTRAINT FK_transactions_restaurant  FOREIGN KEY (restaurant_id)
                                               REFERENCES restaurants (id),
    CONSTRAINT FK_transactions_category    FOREIGN KEY (category_id)
                                               REFERENCES categories (id),
    CONSTRAINT CHK_transactions_confidence CHECK (
        match_confidence IS NULL
        OR (match_confidence >= 0 AND match_confidence <= 1)
    ),
    CONSTRAINT CHK_transactions_amount     CHECK (amount != 0)
);
GO

CREATE INDEX IX_transactions_user_id          ON transactions (user_id);
CREATE INDEX IX_transactions_restaurant_id    ON transactions (restaurant_id)
    WHERE restaurant_id IS NOT NULL;
CREATE INDEX IX_transactions_category_id      ON transactions (category_id)
    WHERE category_id IS NOT NULL;
CREATE INDEX IX_transactions_transaction_date ON transactions (transaction_date);
CREATE INDEX IX_transactions_import_id        ON transactions (import_id)
    WHERE import_id IS NOT NULL;
CREATE INDEX IX_transactions_user_restaurant  ON transactions (user_id, restaurant_id)
    INCLUDE (amount, transaction_date) WHERE restaurant_id IS NOT NULL;
GO

-- =============================================================================
-- SECTION 5: PERSONALIZATION TABLES
-- =============================================================================

CREATE TABLE user_preferences (
    id            INT       NOT NULL IDENTITY(1,1),
    user_id       INT       NOT NULL,
    category_id   INT       NULL,
    restaurant_id INT       NULL,
    notify_deals  BIT       NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_user_preferences            PRIMARY KEY (id),
    CONSTRAINT UQ_user_preferences_scope      UNIQUE (user_id, category_id, restaurant_id),
    CONSTRAINT FK_user_preferences_user       FOREIGN KEY (user_id)
                                                  REFERENCES users (id),
    CONSTRAINT FK_user_preferences_category   FOREIGN KEY (category_id)
                                                  REFERENCES categories (id),
    CONSTRAINT FK_user_preferences_restaurant FOREIGN KEY (restaurant_id)
                                                  REFERENCES restaurants (id)
);
GO

CREATE INDEX IX_user_preferences_user_id       ON user_preferences (user_id);
CREATE INDEX IX_user_preferences_category_id   ON user_preferences (category_id)
    WHERE category_id IS NOT NULL;
CREATE INDEX IX_user_preferences_restaurant_id ON user_preferences (restaurant_id)
    WHERE restaurant_id IS NOT NULL;
GO

-- =============================================================================
-- SECTION 6: NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
    id         INT            NOT NULL IDENTITY(1,1),
    user_id    INT            NOT NULL,
    deal_id    INT            NULL,
    channel    NVARCHAR(20)   NOT NULL DEFAULT 'IN_APP',
    title      NVARCHAR(200)  NOT NULL,
    message    NVARCHAR(1000) NOT NULL,
    status     NVARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    is_read    BIT            NOT NULL DEFAULT 0,
    sent_at    DATETIME2      NULL,
    read_at    DATETIME2      NULL,
    created_at DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_notifications          PRIMARY KEY (id),
    CONSTRAINT FK_notifications_user     FOREIGN KEY (user_id)
                                             REFERENCES users (id),
    CONSTRAINT FK_notifications_deal     FOREIGN KEY (deal_id)
                                             REFERENCES deals (id),
    CONSTRAINT CHK_notifications_channel CHECK (channel IN ('IN_APP','EMAIL','PUSH')),
    CONSTRAINT CHK_notifications_status  CHECK (status  IN ('PENDING','SENT','FAILED','READ')),
    CONSTRAINT CHK_notifications_read_consistency CHECK (
        (is_read = 0 AND read_at IS NULL)
        OR (is_read = 1 AND read_at IS NOT NULL)
    )
);
GO

CREATE INDEX IX_notifications_user_id ON notifications (user_id) WHERE is_read = 0;
CREATE INDEX IX_notifications_status  ON notifications (status)  WHERE status = 'PENDING';
GO

-- =============================================================================
-- SECTION 7: MERCHANT MAPPING
-- =============================================================================

CREATE TABLE merchant_mappings (
    id                 INT          NOT NULL IDENTITY(1,1),
    from_restaurant_id INT          NOT NULL,
    to_restaurant_id   INT          NOT NULL,
    category_id        INT          NULL,
    source             NVARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    confidence         DECIMAL(4,3) NULL,
    is_active          BIT          NOT NULL DEFAULT 1,
    created_at         DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at         DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_merchant_mappings             PRIMARY KEY (id),
    CONSTRAINT UQ_merchant_mappings_pair        UNIQUE (from_restaurant_id, to_restaurant_id),
    CONSTRAINT FK_merchant_mappings_from        FOREIGN KEY (from_restaurant_id)
                                                    REFERENCES restaurants (id),
    CONSTRAINT FK_merchant_mappings_to          FOREIGN KEY (to_restaurant_id)
                                                    REFERENCES restaurants (id),
    CONSTRAINT FK_merchant_mappings_category    FOREIGN KEY (category_id)
                                                    REFERENCES categories (id),
    CONSTRAINT CHK_merchant_mappings_no_self    CHECK (from_restaurant_id <> to_restaurant_id),
    CONSTRAINT CHK_merchant_mappings_source     CHECK (source IN ('MANUAL','ALGORITHM')),
    CONSTRAINT CHK_merchant_mappings_confidence CHECK (
        confidence IS NULL
        OR (confidence >= 0 AND confidence <= 1)
    )
);
GO

CREATE INDEX IX_merchant_mappings_from     ON merchant_mappings (from_restaurant_id) WHERE is_active = 1;
CREATE INDEX IX_merchant_mappings_to       ON merchant_mappings (to_restaurant_id)   WHERE is_active = 1;
CREATE INDEX IX_merchant_mappings_category ON merchant_mappings (category_id)        WHERE is_active = 1;
GO

-- =============================================================================
-- SECTION 8: SYNC INFRASTRUCTURE
-- =============================================================================

CREATE TABLE sync_logs (
    id                   INT          NOT NULL IDENTITY(1,1),
    triggered_by         NVARCHAR(20) NOT NULL,
    sync_type            NVARCHAR(20) NOT NULL,
    target_restaurant_id INT          NULL,
    target_bank_id       INT          NULL,
    api_endpoint         NVARCHAR(500) NULL,
    http_status_code     SMALLINT     NULL,
    records_processed    INT          NOT NULL DEFAULT 0,
    deals_fetched        INT          NOT NULL DEFAULT 0,
    deals_inserted       INT          NOT NULL DEFAULT 0,
    deals_updated        INT          NOT NULL DEFAULT 0,
    deals_expired        INT          NOT NULL DEFAULT 0,
    status               NVARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    error_message        NVARCHAR(MAX) NULL,
    started_at           DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    completed_at         DATETIME2    NULL,

    CONSTRAINT PK_sync_logs              PRIMARY KEY (id),
    CONSTRAINT FK_sync_logs_restaurant   FOREIGN KEY (target_restaurant_id)
                                             REFERENCES restaurants (id),
    CONSTRAINT FK_sync_logs_bank         FOREIGN KEY (target_bank_id)
                                             REFERENCES banks (id),
    CONSTRAINT CHK_sync_logs_triggered   CHECK (triggered_by IN ('SCHEDULED','MANUAL')),
    CONSTRAINT CHK_sync_logs_sync_type   CHECK (sync_type    IN ('FULL','PARTIAL')),
    CONSTRAINT CHK_sync_logs_status      CHECK (status       IN ('RUNNING','SUCCESS','FAILED','PARTIAL'))
);
GO

CREATE INDEX IX_sync_logs_status     ON sync_logs (status)     WHERE status = 'RUNNING';
CREATE INDEX IX_sync_logs_started_at ON sync_logs (started_at);
GO

-- =============================================================================
-- SECTION 9: AUDIT LOG
-- =============================================================================

CREATE TABLE audit_log (
    id         BIGINT        NOT NULL IDENTITY(1,1),
    table_name NVARCHAR(100) NOT NULL,
    record_id  INT           NOT NULL,
    action     NVARCHAR(20)  NOT NULL,
    changed_by INT           NULL,
    old_values NVARCHAR(MAX) NULL,
    new_values NVARCHAR(MAX) NULL,
    created_at DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_audit_log         PRIMARY KEY (id),
    CONSTRAINT CHK_audit_log_action CHECK (action IN ('INSERT','UPDATE','DELETE','SOFT_DELETE'))
);
GO

CREATE INDEX IX_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX IX_audit_log_changed_by   ON audit_log (changed_by) WHERE changed_by IS NOT NULL;
CREATE INDEX IX_audit_log_created_at   ON audit_log (created_at);
GO