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

CREATE OR REPLACE FUNCTION public.get_departments(p_state_code character varying)
RETURNS TABLE(dept_code character varying, dept_name character varying)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT d.dept_code, d.dept_name
  FROM m_department d
  WHERE d.state_code = p_state_code
    AND d.is_active = TRUE
  ORDER BY d.dept_name;
END;
$function$;

