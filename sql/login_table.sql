CREATE TABLE login_table (
  user_id serial PRIMARY KEY,
  username VARCHAR (50) UNIQUE NOT NULL,
  md5 VARCHAR (50) NOT NULL,
  mail VARCHAR (50) NOT NULL,
  md5namemail VARCHAR (50),
  mail_validation BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false
);
