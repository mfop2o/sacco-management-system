-- Seed default permissions
INSERT INTO permissions (id, resource, action, description) VALUES
    (uuid_generate_v4(), 'members', 'CREATE', 'Create members'),
    (uuid_generate_v4(), 'members', 'READ', 'Read members'),
    (uuid_generate_v4(), 'members', 'UPDATE', 'Update members'),
    (uuid_generate_v4(), 'members', 'DELETE', 'Delete members'),
    (uuid_generate_v4(), 'loans', 'CREATE', 'Create loans'),
    (uuid_generate_v4(), 'loans', 'READ', 'Read loans'),
    (uuid_generate_v4(), 'loans', 'UPDATE', 'Update loans'),
    (uuid_generate_v4(), 'loans', 'APPROVE', 'Approve loans'),
    (uuid_generate_v4(), 'loans', 'DISBURSE', 'Disburse loans'),
    (uuid_generate_v4(), 'savings', 'CREATE', 'Create savings accounts'),
    (uuid_generate_v4(), 'savings', 'READ', 'Read savings accounts'),
    (uuid_generate_v4(), 'savings', 'DEPOSIT', 'Deposit to savings'),
    (uuid_generate_v4(), 'savings', 'WITHDRAW', 'Withdraw from savings'),
    (uuid_generate_v4(), 'reports', 'READ', 'Read reports'),
    (uuid_generate_v4(), 'reports', 'GENERATE', 'Generate reports'),
    (uuid_generate_v4(), 'users', 'CREATE', 'Create users'),
    (uuid_generate_v4(), 'users', 'READ', 'Read users'),
    (uuid_generate_v4(), 'users', 'UPDATE', 'Update users'),
    (uuid_generate_v4(), 'settings', 'READ', 'Read settings'),
    (uuid_generate_v4(), 'settings', 'UPDATE', 'Update settings');

-- Seed default branch
INSERT INTO branches (id, code, name, address, phone, email, manager, is_active)
VALUES (uuid_generate_v4(), 'HQ', 'Head Office', '123 Main Street', '+251-11-555-0100', 'hq@sacco.com', 'System Admin', true);

-- Seed admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@sacco.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System',
    'Admin',
    'SYSTEM_ADMIN',
    true,
    true
);
