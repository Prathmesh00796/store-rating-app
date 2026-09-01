-- ============================================
-- Store Rating App — Seed / Demo Data
-- ============================================
-- WARNING: These are development/demo credentials only.
-- Do NOT use these in production.
--
-- Demo Accounts:
--   Admin:       admin@example.com  / Admin@123
--   Store Owner: owner@example.com  / Owner@123
--   Normal User: user@example.com   / User@123
-- ============================================

USE store_rating;

-- ============================================
-- Demo Users
-- Passwords are pre-hashed with bcrypt (10 rounds)
-- ============================================
INSERT INTO users (name, email, password, address, role) VALUES
-- Admin@123
('System Administrator Demo', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '123 Admin Street, New Delhi, India', 'ADMIN'),
-- Owner@123
('Demo Store Owner Account', 'owner@example.com', '$2a$10$YhTHiWQxjGSFsE1Y3fMzDOtCFqX9jSVJK1dWJqKL0FPGdZjhGiHMi', '456 Owner Avenue, Mumbai, India', 'STORE_OWNER'),
-- User@123
('Normal User Demo Account', 'user@example.com', '$2a$10$LJvXE2k3J5WDOBcz.RzOaeYL9FkGZU1GDhMzFdNV9GJfGK8nh1xIu', '789 User Lane, Pune, India', 'NORMAL_USER'),
-- Owner@123
('Second Store Owner Demo', 'owner2@example.com', '$2a$10$YhTHiWQxjGSFsE1Y3fMzDOtCFqX9jSVJK1dWJqKL0FPGdZjhGiHMi', '321 Commerce Road, Bangalore, India', 'STORE_OWNER'),
-- User@123
('Another Normal User Demo', 'user2@example.com', '$2a$10$LJvXE2k3J5WDOBcz.RzOaeYL9FkGZU1GDhMzFdNV9GJfGK8nh1xIu', '654 Second Street, Chennai, India', 'NORMAL_USER');

-- ============================================
-- Demo Stores
-- ============================================
INSERT INTO stores (name, email, address, owner_id) VALUES
('ABC Supermarket Premium', 'abc@example.com', 'MG Road, Pune, Maharashtra', 2),
('XYZ Electronics Store', 'xyz@example.com', 'Andheri West, Mumbai, Maharashtra', 2),
('Fresh Groceries Outlet', 'fresh@example.com', 'Koramangala, Bangalore, Karnataka', 4);

-- ============================================
-- Demo Ratings
-- ============================================
INSERT INTO ratings (user_id, store_id, rating) VALUES
(3, 1, 4),  -- Normal User → ABC Supermarket → 4
(3, 2, 5),  -- Normal User → XYZ Electronics → 5
(5, 1, 3),  -- Another Normal User → ABC Supermarket → 3
(5, 3, 4);  -- Another Normal User → Fresh Groceries → 4
