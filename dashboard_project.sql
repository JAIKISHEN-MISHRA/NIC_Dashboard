-- LGD related tables State,Division,District,Taluka
CREATE TABLE m_state (
    state_code VARCHAR(2) PRIMARY KEY,
    state_name VARCHAR(255) NOT NULL,
    state_name_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_division (
    division_code VARCHAR(3) NOT NULL PRIMARY KEY,
    state_code VARCHAR(2) NOT NULL,
    division_name VARCHAR(255) NOT NULL,
    division_name_ll VARCHAR(255) NOT NULL,
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_district (
    district_code VARCHAR(3) NOT NULL PRIMARY KEY,
    division_code VARCHAR(3) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    district_name VARCHAR(255) NOT NULL,
    district_name_ll VARCHAR(255) NOT NULL,
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_taluka (
    taluka_code VARCHAR(4) NOT NULL PRIMARY KEY,
    district_code VARCHAR(5) NOT NULL,
    division_code VARCHAR(5) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    taluka_name VARCHAR(255) NOT NULL,
    taluka_name_ll VARCHAR(255) NOT NULL,
    FOREIGN KEY (district_code) REFERENCES m_district(district_code),
    FOREIGN KEY (division_code) REFERENCES m_division(division_code),
    FOREIGN KEY (state_code) REFERENCES m_state(state_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

INSERT INTO m_division (division_code, state_code, division_name, division_name_ll)
VALUES 
('01', '27', 'Konkan', 'कोकण'),
('02', '27', 'Pune', 'पुणे'),
('03', '27', 'Nashik', 'नाशिक'),
('04', '27', 'Aurangabad', 'औरंगाबाद'),
('05', '27', 'Amravati', 'अमरावती'),
('06', '27', 'Nagpur', 'नागपूर');


SELECT * FROM m_state;
SELECT * FROM m_division;
SELECT * FROM m_district;
SELECT * FROM m_taluka;

---- User Related Tables:

CREATE TABLE m_role (
    role_code VARCHAR(10) PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    role_name_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE m_user_level (
    user_level_code VARCHAR(10) PRIMARY KEY,
    user_level VARCHAR(255) NOT NULL,
    user_level_ll VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    insert_ip VARCHAR(50) NOT NULL DEFAULT 'NA',
    insert_by VARCHAR(100) NOT NULL DEFAULT 'NA',
    updated_date TIMESTAMP DEFAULT NULL,
    update_ip VARCHAR(50) DEFAULT NULL,
    update_by VARCHAR(100) DEFAULT NULL
);


CREATE TABLE m_user (
    user_code VARCHAR(20) PRIMARY KEY,
    role_code VARCHAR(10) NOT NULL,
    user_level_code VARCHAR(10) NOT NULL,
    user_name VARCHAR(100) UNIQUE NOT NULL,
    password CHAR(64) NOT NULL CHECK (char_length(password) >= 8),
    mobile_number VARCHAR(10) NOT NULL UNIQUE CHECK (mobile_number ~ '^\d{10}$'),
    email_id VARCHAR(255) NOT NULL UNIQUE CHECK (email_id ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
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
    FOREIGN KEY (user_level_code) REFERENCES m_user_level(user_level_code)
);

--to encrypt using sha256
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.password <> OLD.password) THEN
    NEW.password := encode(digest(NEW.password, 'sha256'), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hash_password
BEFORE INSERT OR UPDATE ON m_user
FOR EACH ROW
EXECUTE FUNCTION hash_password();

---Sample Insert Statements:
INSERT INTO m_role (role_code, role_name, role_name_ll, insert_ip, insert_by)
VALUES ( 1, 'Administrator', 'प्रशासक', '127.0.0.1', 'system');

INSERT INTO m_user_level (user_level_code, user_level, user_level_ll, insert_ip, insert_by) 
VALUES (11, 'State Level', 'राज्य स्तर', '127.0.0.1', 'system');

INSERT INTO m_user (
    user_code, role_code, user_level_code, user_name, password,
    mobile_number, email_id, first_name, middle_name, last_name,
    insert_ip, insert_by)  
	VALUES (111, 1, 11, 'user1', 'password123',
    '9876543210', 'user1@example.com', 'Rahul', 'Kumar', 'Sharma',
    '127.0.0.1', 'system'
);

SELECT * FROM m_role;
SELECT * FROM m_user_level;
SELECT * FROM m_user;

-----DropDown(State-->Division-->District-->Taluka)

CREATE FUNCTION dashboard_get_states()
RETURNS TABLE(state_code VARCHAR, state_name TEXT) AS $$
BEGIN 
RETURN QUERY
SELECT state_code, state_name FROM m_state 
WHERE is_active = TRUE
ORDER BY state_name;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION dashboard_get_division(p_state_code VARCHAR)
RETURNS TABLE (division_code VARCHAR, division_name TEXT) AS $$
BEGIN
RETURN QUERY
SELECT division_code, division_name FROM m_division
WHERE state_code = p_state_code AND is_active = TRUE
ORDER BY division_name;
END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION dashboard_get_district(p_division_code VARCHAR)
RETURNS TABLE (district_code VARCHAR, district_name TEXT) AS $$
BEGIN
RETURN QUERY
SELECT district_code, district_name FROM m_district
WHERE division_code = p_division_code AND is_active = TRUE
ORDER BY district_name;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION dashboard_get_talukas(p_district_code VARCHAR)
RETURNS TABLE(taluka_code VARCHAR, taluka_name TEXT) AS $$
BEGIN
RETURN QUERY
SELECT taluka_code, taluka_name FROM m_taluka
WHERE district_code = p_district_code AND is_active = TRUE
ORDER BY taluka_name;
END;
$$ LANGUAGE plpgsql;




