DROP TABLE IF EXISTS signup;

CREATE TABLE signup ( 
  id SERIAL PRIMARY KEY,
  fname TEXT,
  mname TEXT,
  lname TEXT,
  email TEXT UNIQUE,
  mobile TEXT,
  password TEXT,

  state_code VARCHAR(2),
  division_code VARCHAR(3),
  district_code VARCHAR(3),
  taluka_code VARCHAR(4),  -- nullable

  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_signup_state FOREIGN KEY (state_code) REFERENCES m_state(state_code),
  CONSTRAINT fk_signup_division FOREIGN KEY (division_code) REFERENCES m_division(division_code),
  CONSTRAINT fk_signup_district FOREIGN KEY (district_code) REFERENCES m_district(district_code),
  CONSTRAINT fk_signup_taluka FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);

ALTER TABLE signup ADD COLUMN department TEXT;
ALTER TABLE signup ALTER COLUMN division_code DROP NOT NULL;
ALTER TABLE signup ALTER COLUMN district_code DROP NOT NULL;
ALTER TABLE signup ALTER COLUMN taluka_code DROP NOT NULL;

-- SuperAdmin
INSERT INTO m_role (
  role_code, role_name, role_name_ll, is_active,
  insert_date, insert_ip, insert_by
) VALUES (
  'SA', 'SuperAdmin', 'सुपरअॅडमिन', TRUE,
  CURRENT_TIMESTAMP, '127.0.0.1', 'system'
);

-- Admin
INSERT INTO m_role (
  role_code, role_name, role_name_ll, is_active,
  insert_date, insert_ip, insert_by
) VALUES (
  'AD', 'Admin', 'अॅडमिन', TRUE,
  CURRENT_TIMESTAMP, '127.0.0.1', 'system'
);

-- Viewer
INSERT INTO m_role (
  role_code, role_name, role_name_ll, is_active,
  insert_date, insert_ip, insert_by
) VALUES (
  'VW', 'Viewer', 'दर्शक', TRUE,
  CURRENT_TIMESTAMP, '127.0.0.1', 'system'
);

--State Level

INSERT INTO m_user_level (
  user_level_code,user_level, user_level_ll, is_active,
  insert_date, insert_ip, insert_by
) VALUES (
  'ST', 'STATE', 'राज्य', TRUE,
  CURRENT_TIMESTAMP, '127.0.0.1', 'system'
);


--Division Level

INSERT INTO m_user_level (
  user_level_code,user_level, user_level_ll, is_active,
  insert_date, insert_ip, insert_by
) VALUES (
  'DV', 'DIVISION', 'विभाग', TRUE,
  CURRENT_TIMESTAMP, '127.0.0.1', 'system'
);

--District Level

INSERT INTO m_user_level (
  user_level_code,user_level, user_level_ll, is_active,
  insert_date, insert_ip, insert_by
) VALUES (
  'DT', 'DISTRICT', 'जिल्हा', TRUE,
  CURRENT_TIMESTAMP, '127.0.0.1', 'system'
);

CREATE TABLE m_user1 (
    user_code VARCHAR(20) PRIMARY KEY,
    role_code VARCHAR(10) NOT NULL,
    user_level_code VARCHAR(10) NOT NULL,
    user_name VARCHAR(100) UNIQUE NOT NULL,
    password CHAR(64) NOT NULL CHECK (char_length(password) >= 8),
    mobile_number VARCHAR(10) UNIQUE CHECK (mobile_number ~ '^\d{10}$') DEFAULT NULL,
    email_id VARCHAR(255) UNIQUE CHECK (email_id ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') DEFAULT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    middle_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    state_code VARCHAR(2) DEFAULT NULL,
    division_code VARCHAR(3) DEFAULT NULL,
    district_code VARCHAR(3) DEFAULT NULL,
    taluka_code VARCHAR(4) DEFAULT NULL,
    state_name VARCHAR(255) DEFAULT NULL,
    division_name VARCHAR(255) DEFAULT NULL,
    district_name VARCHAR(255) DEFAULT NULL,
    taluka_name VARCHAR(255) DEFAULT NULL,
   department_name VARCHAR(255) DEFAULT NULL,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    last_login_timestamp TIMESTAMP DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL,

    FOREIGN KEY (role_code) REFERENCES m_role(role_code),
    FOREIGN KEY (user_level_code) REFERENCES m_user_level(user_level_code),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code)
);

-- STATE LEVEL
INSERT INTO m_user1 (user_code, role_code, user_level_code, user_name, password)
VALUES 
('ST_AD_01', 'AD', 'ST', 'ST_AD_USER', 'NIC@2024'),
('ST_VW_01', 'VW', 'ST', 'ST_VW_USER', 'NIC@2024');

-- DIVISION LEVEL (6 Admins)
INSERT INTO m_user1 (user_code, role_code, user_level_code, user_name, password)
VALUES
('DV_AD_01', 'AD', 'DV', 'DV_AD_USER_01', 'NIC@2024'),
('DV_AD_02', 'AD', 'DV', 'DV_AD_USER_02', 'NIC@2024'),
('DV_AD_03', 'AD', 'DV', 'DV_AD_USER_03', 'NIC@2024'),
('DV_AD_04', 'AD', 'DV', 'DV_AD_USER_04', 'NIC@2024'),
('DV_AD_05', 'AD', 'DV', 'DV_AD_USER_05', 'NIC@2024'),
('DV_AD_06', 'AD', 'DV', 'DV_AD_USER_06', 'NIC@2024');

-- DISTRICT LEVEL (36 Admins + 36 Viewers)
INSERT INTO m_user1 (user_code, role_code, user_level_code, user_name, password)
VALUES
-- Admins
('DT_AD_01', 'AD', 'DT', 'DT_AD_USER_01', 'NIC@2024'),
('DT_AD_02', 'AD', 'DT', 'DT_AD_USER_02', 'NIC@2024'),
('DT_AD_03', 'AD', 'DT', 'DT_AD_USER_03', 'NIC@2024'),
('DT_AD_04', 'AD', 'DT', 'DT_AD_USER_04', 'NIC@2024'),
('DT_AD_05', 'AD', 'DT', 'DT_AD_USER_05', 'NIC@2024'),
('DT_AD_06', 'AD', 'DT', 'DT_AD_USER_06', 'NIC@2024'),
('DT_AD_07', 'AD', 'DT', 'DT_AD_USER_07', 'NIC@2024'),
('DT_AD_08', 'AD', 'DT', 'DT_AD_USER_08', 'NIC@2024'),
('DT_AD_09', 'AD', 'DT', 'DT_AD_USER_09', 'NIC@2024'),
('DT_AD_10', 'AD', 'DT', 'DT_AD_USER_10', 'NIC@2024'),
('DT_AD_11', 'AD', 'DT', 'DT_AD_USER_11', 'NIC@2024'),
('DT_AD_12', 'AD', 'DT', 'DT_AD_USER_12', 'NIC@2024'),
('DT_AD_13', 'AD', 'DT', 'DT_AD_USER_13', 'NIC@2024'),
('DT_AD_14', 'AD', 'DT', 'DT_AD_USER_14', 'NIC@2024'),
('DT_AD_15', 'AD', 'DT', 'DT_AD_USER_15', 'NIC@2024'),
('DT_AD_16', 'AD', 'DT', 'DT_AD_USER_16', 'NIC@2024'),
('DT_AD_17', 'AD', 'DT', 'DT_AD_USER_17', 'NIC@2024'),
('DT_AD_18', 'AD', 'DT', 'DT_AD_USER_18', 'NIC@2024'),
('DT_AD_19', 'AD', 'DT', 'DT_AD_USER_19', 'NIC@2024'),
('DT_AD_20', 'AD', 'DT', 'DT_AD_USER_20', 'NIC@2024'),
('DT_AD_21', 'AD', 'DT', 'DT_AD_USER_21', 'NIC@2024'),
('DT_AD_22', 'AD', 'DT', 'DT_AD_USER_22', 'NIC@2024'),
('DT_AD_23', 'AD', 'DT', 'DT_AD_USER_23', 'NIC@2024'),
('DT_AD_24', 'AD', 'DT', 'DT_AD_USER_24', 'NIC@2024'),
('DT_AD_25', 'AD', 'DT', 'DT_AD_USER_25', 'NIC@2024'),
('DT_AD_26', 'AD', 'DT', 'DT_AD_USER_26', 'NIC@2024'),
('DT_AD_27', 'AD', 'DT', 'DT_AD_USER_27', 'NIC@2024'),
('DT_AD_28', 'AD', 'DT', 'DT_AD_USER_28', 'NIC@2024'),
('DT_AD_29', 'AD', 'DT', 'DT_AD_USER_29', 'NIC@2024'),
('DT_AD_30', 'AD', 'DT', 'DT_AD_USER_30', 'NIC@2024'),
('DT_AD_31', 'AD', 'DT', 'DT_AD_USER_31', 'NIC@2024'),
('DT_AD_32', 'AD', 'DT', 'DT_AD_USER_32', 'NIC@2024'),
('DT_AD_33', 'AD', 'DT', 'DT_AD_USER_33', 'NIC@2024'),
('DT_AD_34', 'AD', 'DT', 'DT_AD_USER_34', 'NIC@2024'),
('DT_AD_35', 'AD', 'DT', 'DT_AD_USER_35', 'NIC@2024'),
('DT_AD_36', 'AD', 'DT', 'DT_AD_USER_36', 'NIC@2024'),

-- Viewers
('DT_VW_01', 'VW', 'DT', 'DT_VW_USER_01', 'NIC@2024'),
('DT_VW_02', 'VW', 'DT', 'DT_VW_USER_02', 'NIC@2024'),
('DT_VW_03', 'VW', 'DT', 'DT_VW_USER_03', 'NIC@2024'),
('DT_VW_04', 'VW', 'DT', 'DT_VW_USER_04', 'NIC@2024'),
('DT_VW_05', 'VW', 'DT', 'DT_VW_USER_05', 'NIC@2024'),
('DT_VW_06', 'VW', 'DT', 'DT_VW_USER_06', 'NIC@2024'),
('DT_VW_07', 'VW', 'DT', 'DT_VW_USER_07', 'NIC@2024'),
('DT_VW_08', 'VW', 'DT', 'DT_VW_USER_08', 'NIC@2024'),
('DT_VW_09', 'VW', 'DT', 'DT_VW_USER_09', 'NIC@2024'),
('DT_VW_10', 'VW', 'DT', 'DT_VW_USER_10', 'NIC@2024'),
('DT_VW_11', 'VW', 'DT', 'DT_VW_USER_11', 'NIC@2024'),
('DT_VW_12', 'VW', 'DT', 'DT_VW_USER_12', 'NIC@2024'),
('DT_VW_13', 'VW', 'DT', 'DT_VW_USER_13', 'NIC@2024'),
('DT_VW_14', 'VW', 'DT', 'DT_VW_USER_14', 'NIC@2024'),
('DT_VW_15', 'VW', 'DT', 'DT_VW_USER_15', 'NIC@2024'),
('DT_VW_16', 'VW', 'DT', 'DT_VW_USER_16', 'NIC@2024'),
('DT_VW_17', 'VW', 'DT', 'DT_VW_USER_17', 'NIC@2024'),
('DT_VW_18', 'VW', 'DT', 'DT_VW_USER_18', 'NIC@2024'),
('DT_VW_19', 'VW', 'DT', 'DT_VW_USER_19', 'NIC@2024'),
('DT_VW_20', 'VW', 'DT', 'DT_VW_USER_20', 'NIC@2024'),
('DT_VW_21', 'VW', 'DT', 'DT_VW_USER_21', 'NIC@2024'),
('DT_VW_22', 'VW', 'DT', 'DT_VW_USER_22', 'NIC@2024'),
('DT_VW_23', 'VW', 'DT', 'DT_VW_USER_23', 'NIC@2024'),
('DT_VW_24', 'VW', 'DT', 'DT_VW_USER_24', 'NIC@2024'),
('DT_VW_25', 'VW', 'DT', 'DT_VW_USER_25', 'NIC@2024'),
('DT_VW_26', 'VW', 'DT', 'DT_VW_USER_26', 'NIC@2024'),
('DT_VW_27', 'VW', 'DT', 'DT_VW_USER_27', 'NIC@2024'),
('DT_VW_28', 'VW', 'DT', 'DT_VW_USER_28', 'NIC@2024'),
('DT_VW_29', 'VW', 'DT', 'DT_VW_USER_29', 'NIC@2024'),
('DT_VW_30', 'VW', 'DT', 'DT_VW_USER_30', 'NIC@2024'),
('DT_VW_31', 'VW', 'DT', 'DT_VW_USER_31', 'NIC@2024'),
('DT_VW_32', 'VW', 'DT', 'DT_VW_USER_32', 'NIC@2024'),
('DT_VW_33', 'VW', 'DT', 'DT_VW_USER_33', 'NIC@2024'),
('DT_VW_34', 'VW', 'DT', 'DT_VW_USER_34', 'NIC@2024'),
('DT_VW_35', 'VW', 'DT', 'DT_VW_USER_35', 'NIC@2024'),
('DT_VW_36', 'VW', 'DT', 'DT_VW_USER_36', 'NIC@2024');

--Super Admin
INSERT INTO m_user1 (user_code, role_code, user_level_code, user_name, password)
VALUES 
('ST_SA_01', 'SA', 'ST', 'ST_SA_USER', 'NIC@2024')

SELECT * FROM m_user1;


-- Add column to track who approved the signup
ALTER TABLE signup
ADD COLUMN approved_by VARCHAR(20);

-- Add foreign key constraint linking to m_user1
ALTER TABLE signup
ADD CONSTRAINT fk_signup_approved_by
FOREIGN KEY (approved_by) REFERENCES m_user1(user_code);

-- Add foreign key constraint linking to m_user1
ALTER TABLE signup
ADD CONSTRAINT fk_signup_approved_by
FOREIGN KEY (approved_by) REFERENCES m_user1(user_code);


ALTER TABLE m_user1
ADD COLUMN is_assigned BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE m_user1
SET is_active = false,
    is_assigned = false;


UPDATE m_user1
SET is_active = true,
    is_assigned = false
WHERE user_code = 'ST_SA_01';

