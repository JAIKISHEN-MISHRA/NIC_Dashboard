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

--Data in m_state,m_district,m_taluka should be imported using csv files
---Insert stmts for m_division:
INSERT INTO m_division (division_code, state_code, division_name, division_name_ll)
VALUES 
('01', '27', 'Konkan', 'कोकण'),
('02', '27', 'Pune', 'पुणे'),
('03', '27', 'Nashik', 'नाशिक'),
('04', '27', 'Aurangabad', 'औरंगाबाद'),
('05', '27', 'Amravati', 'अमरावती'),
('06', '27', 'Nagpur', 'नागपूर');

---Select stmts to see all the data in LGD tables
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
	state_code VARCHAR(2),
    division_code VARCHAR(3),
    district_code VARCHAR(3),
    taluka_code VARCHAR(4),
	state_name VARCHAR(255),
    division_name VARCHAR(255),
    district_name VARCHAR(255),
    taluka_name VARCHAR(255),
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
    user_code, role_code, user_level_code, user_name, password,mobile_number, email_id, first_name, middle_name, last_name,
    state_code, state_name,division_code, division_name,district_code, district_name,taluka_code, taluka_name,
    insert_ip, insert_by
)
VALUES (
    '111', '1', '11', 'user1', 'password123','9876543210', 'user1@example.com', 'Rahul', 'Kumar', 'Sharma','27', 'Maharashtra',
    '02', 'Pune','490', 'Pune','4193', 'Haveli','127.0.0.1', 'system');

---Select stmts to see all the data in User tables
SELECT * FROM m_role;
SELECT * FROM m_user_level;
SELECT * FROM m_user;


-----DropDown(State-->Division-->District-->Taluka)

CREATE OR REPLACE FUNCTION dashboard_get_states()
RETURNS TABLE(state_code VARCHAR, state_name VARCHAR) AS $$
BEGIN 
  RETURN QUERY
  SELECT m_state.state_code, m_state.state_name
  FROM m_state 
  WHERE m_state.is_active = TRUE
  ORDER BY m_state.state_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dashboard_get_division(p_state_code VARCHAR)
RETURNS TABLE (division_code VARCHAR, division_name VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT m_division.division_code, m_division.division_name
  FROM m_division
  WHERE m_division.state_code = p_state_code AND m_division.is_active = TRUE
  ORDER BY m_division.division_name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION dashboard_get_district(p_division_code VARCHAR)
RETURNS TABLE (district_code VARCHAR, district_name VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT m_district.district_code, m_district.district_name
  FROM m_district
  WHERE m_district.division_code = p_division_code AND m_district.is_active = TRUE
  ORDER BY m_district.district_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dashboard_get_talukas(p_district_code VARCHAR)
RETURNS TABLE (taluka_code VARCHAR, taluka_name VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT m_taluka.taluka_code, m_taluka.taluka_name
  FROM m_taluka
  WHERE m_taluka.district_code = p_district_code AND m_taluka.is_active = TRUE
  ORDER BY m_taluka.taluka_name;
END;
$$ LANGUAGE plpgsql;


--Test to check if Functions work
SELECT * FROM dashboard_get_states();
SELECT * FROM dashboard_get_division('27');
SELECT * FROM dashboard_get_district('02');
SELECT * FROM dashboard_get_talukas('490');

---Category (Dashboard) Tables
CREATE TABLE m_main_category(
m_category_code VARCHAR PRIMARY KEY,
m_category_name VARCHAR(255) NOT NULL,
m_category_name_ll VARCHAR(255) NOT NULL
); 

CREATE TABLE m_category(
category_code VARCHAR PRIMARY KEY,
m_category_code VARCHAR NOT NULL,
category_name VARCHAR(255) NOT NULL,
category_name_ll VARCHAR(255) NOT NULL,
FOREIGN KEY (m_category_code) REFERENCES m_main_category(m_category_code)
);

CREATE TABLE m_sub_category(
sub_category_code VARCHAR PRIMARY KEY,
m_category_code VARCHAR NOT NULL,
category_code VARCHAR NOT NULL,
sub_category_name VARCHAR(255) DEFAULT NULL,
sub_category_name_ll VARCHAR(255) DEFAULT NULL,
FOREIGN KEY (m_category_code) REFERENCES m_main_category(m_category_code),
FOREIGN KEY (category_code) REFERENCES m_category(category_code)
);

--Function to insert in Category tables:
CREATE OR REPLACE FUNCTION insert_main_category(
  p_m_category_code VARCHAR,
  p_m_category_name VARCHAR,
  p_m_category_name_ll VARCHAR
) RETURNS VOID AS $$
BEGIN
  INSERT INTO m_main_category (
    m_category_code, m_category_name, m_category_name_ll
  ) VALUES (
    p_m_category_code, p_m_category_name, p_m_category_name_ll
  )
  ON CONFLICT (m_category_code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_category(
  p_category_code VARCHAR,
  p_m_category_code VARCHAR,
  p_category_name VARCHAR,
  p_category_name_ll VARCHAR
) RETURNS VOID AS $$
BEGIN
  INSERT INTO m_category (
    category_code, m_category_code, category_name, category_name_ll
  ) VALUES (
    p_category_code, p_m_category_code, p_category_name, p_category_name_ll
  )
  ON CONFLICT (category_code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

 
CREATE OR REPLACE FUNCTION insert_sub_category(
  p_sub_category_code VARCHAR,
  p_m_category_code VARCHAR,
  p_category_code VARCHAR,
  p_sub_category_name VARCHAR,
  p_sub_category_name_ll VARCHAR
) RETURNS VOID AS $$
BEGIN
  INSERT INTO m_sub_category(
    sub_category_code, m_category_code, category_code,
    sub_category_name, sub_category_name_ll
  ) VALUES (
    p_sub_category_code, p_m_category_code, p_category_code,
    p_sub_category_name, p_sub_category_name_ll
  )
  ON CONFLICT (sub_category_code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

---Test stmts to check function
SELECT insert_main_category('M01','Agriculture','कृषी');
SELECT insert_category('C01','M01','Crop Production','पिक उत्पादन');
SELECT insert_sub_category('SC01','M01','C01','Wheat','गहू');

---Month table
CREATE TABLE m_month(
month_num VARCHAR(2) PRIMARY KEY,
month_name VARCHAR(255) NOT NULL,
month_name_ll VARCHAR(255) NOT NULL
);

INSERT INTO m_month (month_num,month_name,month_name_ll)
VALUES
('01','January','जानेवारी'),
('02','February','फेब्रुवारी'),
('03','March','मार्च'),
('04','April','एप्रिल'),
('05','May','मे'),
('06','June','जून'),
('07','July','जुलै'),
('08','August','ऑगस्ट'),
('09','September','सप्टेंबर'),
('10','October','ऑक्टोबर'),
('11','November','नोव्हेंबर'),
('12','December','डिसेंबर')

SELECT * FROM m_month;

--Table for Vasuli(Yet to create it dynamically)
CREATE TABLE t_001_table(
m_category_code VARCHAR NOT NULL,
category_code VARCHAR NOT NULL,
sub_category_code VARCHAR DEFAULT NULL,
state_code VARCHAR(2) NOT NULL,
division_code VARCHAR(2) NOT NULL,
district_code VARCHAR(3) NOT NULL,
taluka_code VARCHAR(4) NOT NULL,
figures DECIMAL(10, 2) DEFAULT 0.00, 
month_num VARCHAR NOT NULL,
year_num VARCHAR NOT NULL,
FOREIGN KEY (m_category_code) REFERENCES m_main_category(m_category_code),
FOREIGN KEY (category_code) REFERENCES m_category(category_code),
FOREIGN KEY (sub_category_code) REFERENCES m_sub_category(sub_category_code),
FOREIGN KEY (state_code) REFERENCES m_state(state_code),
FOREIGN KEY (division_code) REFERENCES m_division(division_code),
FOREIGN KEY (district_code) REFERENCES m_district(district_code),
FOREIGN KEY (taluka_code) REFERENCES m_taluka(taluka_code),
FOREIGN KEY (month_num) REFERENCES m_month(month_num)
);

---Insert statements:
INSERT INTO m_main_category(m_category_code,m_category_name,m_category_name_ll)
VALUES ('001','REVENUE COLLECTION TARGET','महसूल वसूलीचे उद्दिष्ट'),
('002','Sanjay Gandhi Yojna','संजय गांधी योजना');

INSERT INTO m_category(category_code,m_category_code,category_name,category_name_ll)
--VALUES ('0029','001','Land Revenue','जमीन महसूल');
VALUES ('0045','001','Entertainment+Ad+Betting Taxes','करमणूक कर +जाहिरात कर +पैजकर'),
('0853','001','Royalty from Minor Mineral Excavation','गौणखनिज उत्खनन नियमापासून मिळणाऱ्या जमा रकमा'),
('0001','001','RRC(Personal account deposit)','आर.आर.सी. (व्यैयक्तिक लेखा ठेव)'),
('0002','001','Education Cess','शिक्षण उपकर'),
('0003','001','BBR(Urban Development)','बी.बी. आर (नगर विकास )'),
('0004','001','RTI','आर.टी. आय');
 
INSERT INTO m_sub_category(sub_category_code,m_category_code,category_code,sub_category_name,sub_category_name_ll)
VALUES 
('01','001','0029','Target','उद्दिष्ट'),
('02','001','0029','Collection','वसूली')
('03','001','0045','Target','उद्दिष्ट'),
('04','001','0045','Collection','वसूली'),
('05','001','0853','Target','उद्दिष्ट'),
('06','001','0853','Collection','वसूली'),
('07','001','0001','Collection','वसूली'),
('08','001','0002','Collection','वसूली'),
('09','001','0003','Collection','वसूली'),
('10','001','0004','Collection','वसूली')

INSERT INTO t_001_table (m_category_code,category_code,sub_category_code,state_code,division_code,district_code,taluka_code,figures, month_num,year_num)
VALUES
('001','0029','01','27','01','482','7000','30699.55','04','2025'),
('001','0029','02','27','01','482','7000','618.25','04','2025'),
('001','0029','01','27','01','482','7000','30699.55','05','2025'),
('001','0029','02','27','01','482','7000','3792.99','05','2025'),
('001','0029','01','27','01','482','7000','30699.55','06','2025'),
('001','0029','02','27','01','482','7000','909.31','06','2025'),
('001','0029','01','27','01','482','7000','30699.55','07','2025'),
('001','0029','02','27','01','482','7000','987.64','07','2025')

--Select Stmts to check data in category tables
SELECT * FROM m_main_category;
SELECT * FROM m_category;
SELECT * FROM m_sub_category;

--- Function to get complete data:
CREATE OR REPLACE FUNCTION get_records_by_category(
    p_m_category_code   TEXT DEFAULT NULL,
    p_category_code     TEXT DEFAULT NULL,
    p_sub_category_code TEXT DEFAULT NULL,
    p_state_code        TEXT DEFAULT NULL,
    p_division_code     TEXT DEFAULT NULL,
    p_district_code     TEXT DEFAULT NULL,
    p_taluka_code       TEXT DEFAULT NULL
)
RETURNS TABLE (
    m_category_code VARCHAR, m_category_name VARCHAR,category_code VARCHAR,
    category_name VARCHAR,
    state_code VARCHAR(2),state_name VARCHAR,division_code VARCHAR(2),
    division_name VARCHAR,district_code VARCHAR(3),district_name VARCHAR,
    taluka_code VARCHAR(4),taluka_name VARCHAR,sub_category_code   VARCHAR,sub_category_name VARCHAR,figures DECIMAL(10, 2),
    month_num VARCHAR,year_num VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.m_category_code,mc.m_category_name,t.category_code,c.category_name,t.state_code,s.state_name,t.division_code,d.division_name,t.district_code,
        dist.district_name,t.taluka_code,ta.taluka_name,t.sub_category_code,
        sc.sub_category_name,t.figures,t.month_num,t.year_num
    FROM t_001_table t
    JOIN m_main_category mc ON t.m_category_code = mc.m_category_code
    JOIN m_category c ON t.category_code = c.category_code
    LEFT JOIN m_sub_category sc ON t.sub_category_code = sc.sub_category_code
    JOIN m_state s ON t.state_code = s.state_code
    JOIN m_division d ON t.division_code = d.division_code
    JOIN m_district dist ON t.district_code = dist.district_code
    JOIN m_taluka ta ON t.taluka_code = ta.taluka_code
    JOIN m_month m ON t.month_num = m.month_num
    WHERE 
        (p_m_category_code IS NULL OR t.m_category_code = p_m_category_code) AND
        (p_category_code IS NULL OR t.category_code = p_category_code) AND
        (p_state_code IS NULL OR t.state_code = p_state_code) AND
        (p_division_code IS NULL OR t.division_code = p_division_code) AND
        (p_district_code IS NULL OR t.district_code = p_district_code) AND
        (p_taluka_code IS NULL OR t.taluka_code = p_taluka_code) AND
        (p_sub_category_code IS NULL OR t.sub_category_code = p_sub_category_code);
END;
$$ LANGUAGE plpgsql;

-- Test sql queries for function:
SELECT * FROM get_records_by_category('001');
SELECT * FROM get_records_by_category();
SELECT * FROM get_records_by_category(p_state_code := '27',p_sub_category_code := '02');

---To get target vs collection data:
CREATE OR REPLACE FUNCTION dashboard_get_target_vs_collection(
    p_m_category_code   TEXT DEFAULT NULL,
    p_category_code     TEXT DEFAULT NULL,
    p_sub_category_code TEXT DEFAULT NULL,
    p_state_code        TEXT DEFAULT NULL,
    p_division_code     TEXT DEFAULT NULL,
    p_district_code     TEXT DEFAULT NULL,
    p_taluka_code       TEXT DEFAULT NULL
)
RETURNS TABLE (
    month_num VARCHAR,
    year_num VARCHAR,
    target_amount DECIMAL(10, 2),
    collection_amount DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.month_num,
        r.year_num,
        SUM(CASE 
            WHEN r.sub_category_name = 'Target' THEN r.figures 
            ELSE 0 
        END) AS target_amount,
        SUM(CASE 
            WHEN r.sub_category_name = 'Collection' THEN r.figures 
            ELSE 0 
        END) AS collection_amount
    FROM get_records_by_category(
        p_m_category_code,
        p_category_code,
        p_sub_category_code,
        p_state_code,
        p_division_code,
        p_district_code,
        p_taluka_code
    ) r
    GROUP BY r.month_num, r.year_num
    ORDER BY r.year_num, r.month_num;
END;
$$ LANGUAGE plpgsql;


--TEST query for target vs collection:
SELECT * FROM dashboard_get_target_vs_collection();


---If we want complete details with target vs collection:
CREATE OR REPLACE FUNCTION get_target_vs_collection1(
    p_m_category_code   TEXT DEFAULT NULL,
    p_category_code     TEXT DEFAULT NULL,
    p_sub_category_code TEXT DEFAULT NULL,
    p_state_code        TEXT DEFAULT NULL,
    p_division_code     TEXT DEFAULT NULL,
    p_district_code     TEXT DEFAULT NULL,
    p_taluka_code       TEXT DEFAULT NULL
)
RETURNS TABLE (
    m_category_code VARCHAR,m_category_name VARCHAR,category_code VARCHAR,
    category_name VARCHAR,state_code VARCHAR(2),state_name VARCHAR,
    division_code VARCHAR(2),division_name VARCHAR,district_code VARCHAR(3),district_name VARCHAR,
    taluka_code VARCHAR(4),taluka_name VARCHAR,month_num VARCHAR,
    year_num VARCHAR,target_amount DECIMAL(10, 2),collection_amount DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.m_category_code, r.m_category_name, r.category_code, r.category_name,
        r.state_code, r.state_name, r.division_code,r.division_name,
        r.district_code,r.district_name,r.taluka_code,r.taluka_name,
        r.month_num, r.year_num,
        SUM(CASE 
            WHEN r.sub_category_name = 'Target' THEN r.figures 
            ELSE 0 
        END) AS target_amount,
        SUM(CASE 
            WHEN r.sub_category_name = 'Collection' THEN r.figures 
            ELSE 0 
        END) AS collection_amount
    FROM get_records_by_category(
        p_m_category_code,
        p_category_code,
        p_sub_category_code,
        p_state_code,
        p_division_code,
        p_district_code,
        p_taluka_code
    ) r
    GROUP BY 
	r.m_category_code,r.m_category_name,r.category_code, r.category_name, r.state_code,
    r.state_name,r.division_code,r.division_name,r.district_code,r.district_name,
    r.taluka_code,r.taluka_name,r.month_num,r.year_num
    ORDER BY r.year_num, r.month_num;
END;
$$ LANGUAGE plpgsql;

--Test Query :
SELECT * FROM get_target_vs_collection1();


