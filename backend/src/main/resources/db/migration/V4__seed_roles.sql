-- Seed default roles matching the UserRole enum
INSERT INTO roles (id, name, description, is_system, is_active) VALUES
    (uuid_generate_v4(), 'SUPER_ADMIN', 'Unrestricted access to all modules, system configuration, and user management.', TRUE, TRUE),
    (uuid_generate_v4(), 'SYSTEM_ADMIN', 'Full operational access except system-level configuration.', TRUE, TRUE),
    (uuid_generate_v4(), 'BRANCH_MANAGER', 'Manages branch operations. Can approve loans and oversee member accounts.', TRUE, TRUE),
    (uuid_generate_v4(), 'LOAN_OFFICER', 'Processes loan applications and recommends approval or rejection.', TRUE, TRUE),
    (uuid_generate_v4(), 'TELLER', 'Handles day-to-day cash transactions at the counter.', TRUE, TRUE),
    (uuid_generate_v4(), 'ACCOUNTANT', 'Reviews financial records and generates reports.', TRUE, TRUE),
    (uuid_generate_v4(), 'AUDITOR', 'Read-only access across all financial data for compliance.', TRUE, TRUE),
    (uuid_generate_v4(), 'MEMBER', 'SACCO member — can view accounts, apply for loans, and make repayments.', TRUE, TRUE);

-- Assign all permissions to SUPER_ADMIN and SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('SUPER_ADMIN', 'SYSTEM_ADMIN');

-- BRANCH_MANAGER: members full, loans full, savings full, transactions read, users read, reports full
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'BRANCH_MANAGER'
  AND (p.resource IN ('members', 'loans', 'savings', 'reports') OR (p.resource = 'users' AND p.action = 'READ') OR (p.resource = 'transactions'));

-- LOAN_OFFICER: members read, loans create/read/update, savings read, transactions read, reports read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'LOAN_OFFICER'
  AND ((p.resource = 'members' AND p.action IN ('READ', 'UPDATE'))
    OR (p.resource = 'loans' AND p.action IN ('CREATE', 'READ', 'UPDATE', 'APPROVE'))
    OR (p.resource = 'savings' AND p.action = 'READ')
    OR (p.resource = 'transactions' AND p.action = 'READ')
    OR (p.resource = 'reports' AND p.action = 'READ'));

-- TELLER: members read, loans read, savings deposit/withdraw, transactions create/read, reports read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'TELLER'
  AND ((p.resource = 'members' AND p.action = 'READ')
    OR (p.resource = 'loans' AND p.action = 'READ')
    OR (p.resource = 'savings' AND p.action IN ('READ', 'DEPOSIT', 'WITHDRAW'))
    OR (p.resource = 'transactions' AND p.action IN ('CREATE', 'READ'))
    OR (p.resource = 'reports' AND p.action = 'READ'));

-- ACCOUNTANT: members read, loans read, savings read, transactions read, reports all
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ACCOUNTANT'
  AND ((p.resource IN ('members', 'loans', 'savings') AND p.action = 'READ')
    OR p.resource = 'transactions'
    OR p.resource = 'reports');

-- AUDITOR: read-only across all
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'AUDITOR'
  AND p.action = 'READ';

-- MEMBER: limited self-service
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'MEMBER'
  AND ((p.resource = 'members' AND p.action = 'READ')
    OR (p.resource = 'loans' AND p.action IN ('CREATE', 'READ'))
    OR (p.resource = 'savings' AND p.action = 'READ')
    OR (p.resource = 'transactions' AND p.action = 'READ'));
