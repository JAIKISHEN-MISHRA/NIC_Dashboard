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
