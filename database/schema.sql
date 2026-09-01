-- ============================================
-- Store Rating App — Database Schema
-- MySQL 8.0+
-- ============================================

CREATE DATABASE IF NOT EXISTS store_rating;
USE store_rating;

-- ============================================
-- Users Table
-- Stores all three roles: ADMIN, NORMAL_USER, STORE_OWNER
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(60)  NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    address     VARCHAR(400),
    role        ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Name must be between 20 and 60 characters
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 20)
);

-- Index for login lookups and filtering
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
CREATE INDEX idx_users_name  ON users(name);

-- ============================================
-- Stores Table
-- Each store is owned by a STORE_OWNER user
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    address     VARCHAR(400),
    owner_id    INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key: owner must be a valid user
    CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_stores_name     ON stores(name);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);

-- ============================================
-- Ratings Table
-- Normal users submit ratings (1-5) for stores
-- One rating per user per store (enforced by UNIQUE constraint)
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    store_id    INT NOT NULL,
    rating      TINYINT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Each user can rate a store only once
    CONSTRAINT uq_user_store UNIQUE (user_id, store_id),

    -- Rating must be between 1 and 5
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),

    -- Foreign keys
    CONSTRAINT fk_ratings_user  FOREIGN KEY (user_id)  REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_id  ON ratings(user_id);
