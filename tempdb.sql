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
