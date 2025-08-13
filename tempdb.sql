CREATE TABLE Approval (
    id SERIAL PRIMARY KEY,
    user_code VARCHAR(50) NOT NULL,
    user_level_code VARCHAR(10) NOT NULL,
    role_code VARCHAR(10) NOT NULL,
    division_code VARCHAR(50) NOT NULL,
    scheme_code VARCHAR(50) NOT NULL,
    state_code VARCHAR(50) NOT NULL,
    district_code VARCHAR(50),
    taluka_code VARCHAR(50),
    year INT NOT NULL,
    month VARCHAR(2) NOT NULL,
    data JSONB NOT NULL,
    approved_by VARCHAR(50), -- will store approver's user_code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

