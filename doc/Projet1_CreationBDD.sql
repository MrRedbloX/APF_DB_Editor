DROP TABLE object_table CASCADE;
DROP TABLE provider_table CASCADE;
DROP TABLE ressource_table CASCADE;
DROP TABLE terraform_table CASCADE;
DROP TABLE dockerfile_table CASCADE;
DROP TABLE variable_table CASCADE;
DROP TABLE playbook_table CASCADE;
DROP TABLE script_table CASCADE;
DROP TABLE map_object_object CASCADE;
DROP TABLE map_ressource_provider CASCADE;
DROP TABLE map_ressource_dockerfile CASCADE;
DROP TABLE map_ressource_terraform CASCADE;
DROP TABLE map_ressource_playbook CASCADE;
DROP TABLE map_ressource_script CASCADE;

CREATE TABLE object_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	datajson varchar(50) NOT NULL
);

CREATE TABLE provider_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL
);

CREATE TABLE ressource_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	description varchar(100),
	order_use INT NOT NULL,
	id_object INT references object_table
);

CREATE TABLE terraform_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200),
	id_provider INT references provider_table
);

CREATE TABLE dockerfile_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200)
);

CREATE TABLE variable_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	data_json varchar(50) NOT NULL,
	type varchar(20) NOT NULL,
	id_object INT references object_table
);

CREATE TABLE playbook_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200)
);

CREATE TABLE script_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200)
);

CREATE TABLE map_object_object(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_object_up INT references object_table,
	id_object_down INT references object_table
);

CREATE TABLE map_ressource_provider(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_provider INT references provider_table
);

CREATE TABLE map_ressource_dockerfile(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_dockerfile INT references dockerfile_table
);

CREATE TABLE map_ressource_terraform(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_terraform INT references terraform_table
);

CREATE TABLE map_ressource_playbook(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_playbook INT references playbook_table

);

CREATE TABLE map_ressource_script(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_script INT references script_table
);


INSERT INTO provider_table(name) 
VALUES ('AWS'), ('Flexible Engine'), ('Azure');

INSERT INTO terraform_table(name, path_file, description, id_provider)
VALUES ('VM', '/Flexible_Engine/jinja/Template_Jinja_FE_ECS_Vol_EIP.jinja', 'template jinja to create ECS on FE', 2), 
('VPC', '/Flexible_Engine/jinja/Template_Jinja_FE_VPC.jinja', 'template jinja to create VPC and subnets on FE', 2), 
('security group', '/Flexible_Engine/jinja/Template_Jinja_FE_SG.jinja', 'template jinja to create security group on FE', 2),
('ssh Key', '/Flexible_Engine/jinja/Template_Jinja_FE_sshKey.jinja', 'template jinja to create ssh key on FE', 2);

INSERT INTO playbook_table(name, path_file, description)
VALUES ('LVM disk', 'playbook_linux_LVM_disk.yml', 'playbook to use lvm on linux');

INSERT INTO object_table(name, datajson)
VALUES ('security groups', 'groups_security'), ('subnet VPC','subnets'), ('VPC', 'VPC_groups'), ('ECS', 'ECS'), ('ssh key', 'SSH_keys'), ('disk for VM', 'storage');

INSERT INTO variable_table(name, data_json, type, id_object)
VALUES ('name of vpc', 'string', 'name_vpc', 3), ('name of subnet for vpc', 'string', 'Subnet_name', 2), ('subnet cidr for vpc', 'string', 'Subnet_CIDR', 2);

INSERT INTO ressource_table(name, description, order_use, id_object)
VALUES ('VPC and Subnet', 'Creation of VPC and subnet for FE', 1, 3),
('security groups', 'Creation of security groups', 1, 1),
('ECS', 'Creation of ECS', 2, 4),
('ssh key', 'Creation of ssh key', 1, 5),
('disk', 'Configuration of disk with LVM', 1, 6);

INSERT INTO map_object_object(id_object_up, id_object_down)
VALUES (3,2);

INSERT INTO map_ressource_provider(id_ressource, id_provider)
VALUES (1,2), (2,2);

INSERT INTO map_ressource_terraform(id_ressource, id_terraform)
VALUES (1,2), (2,3), (3,1), (4,4);

INSERT INTO map_ressource_playbook(id_ressource, id_playbook)
VALUES (5,1);
CREATE TABLE object_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	datajson varchar(50) NOT NULL
);

CREATE TABLE provider_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL
);

CREATE TABLE ressource_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	description varchar(100),
	order_use INT NOT NULL,
	id_object INT references object_table
);

CREATE TABLE terraform_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200),
	id_provider INT references provider_table
);

CREATE TABLE dockerfile_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200)
);

CREATE TABLE variable_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	data_json varchar(50) NOT NULL,
	type varchar(20) NOT NULL,
	id_object INT references object_table
);

CREATE TABLE playbook_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200)
);

CREATE TABLE script_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	name varchar(50) NOT NULL,
	path_file varchar(100) NOT NULL,
	description varchar(200)
);

CREATE TABLE map_object_object(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_object_up INT references object_table,
	id_object_down INT references object_table
);

CREATE TABLE map_ressource_provider(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_provider INT references provider_table
);

CREATE TABLE map_ressource_dockerfile(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_dockerfile INT references dockerfile_table
);

CREATE TABLE map_ressource_terraform(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_terraform INT references terraform_table
);

CREATE TABLE map_ressource_playbook(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_playbook INT references playbook_table

);

CREATE TABLE map_ressource_script(
	uuid SERIAL PRIMARY KEY NOT NULL,
	id_ressource INT references ressource_table,
	id_script INT references script_table
);


INSERT INTO provider_table(name) 
VALUES ('AWS'), ('Flexible Engine'), ('Azure');

INSERT INTO terraform_table(name, path_file, description, id_provider)
VALUES ('VM', '/Flexible_Engine/jinja/Template_Jinja_FE_ECS_Vol_EIP.jinja', 'template jinja to create ECS on FE', 2), 
('VPC', '/Flexible_Engine/jinja/Template_Jinja_FE_VPC.jinja', 'template jinja to create VPC and subnets on FE', 2), 
('security group', '/Flexible_Engine/jinja/Template_Jinja_FE_SG.jinja', 'template jinja to create security group on FE', 2),
('ssh Key', '/Flexible_Engine/jinja/Template_Jinja_FE_sshKey.jinja', 'template jinja to create ssh key on FE', 2);

INSERT INTO playbook_table(name, path_file, description)
VALUES ('LVM disk', 'playbook_linux_LVM_disk.yml', 'playbook to use lvm on linux');

INSERT INTO object_table(name, datajson)
VALUES ('security groups', 'groups_security'), ('subnet VPC','subnets'), ('VPC', 'VPC_groups'), ('ECS', 'ECS'), ('ssh key', 'SSH_keys'), ('disk for VM', 'storage');

INSERT INTO variable_table(name, data_json, type, id_object)
VALUES ('name of vpc', 'string', 'name_vpc', 3), ('name of subnet for vpc', 'string', 'Subnet_name', 2), ('subnet cidr for vpc', 'string', 'Subnet_CIDR', 2);

INSERT INTO ressource_table(name, description, order_use, id_object)
VALUES ('VPC and Subnet', 'Creation of VPC and subnet for FE', 1, 3),
('security groups', 'Creation of security groups', 1, 1),
('ECS', 'Creation of ECS', 2, 4),
('ssh key', 'Creation of ssh key', 1, 5),
('disk', 'Configuration of disk with LVM', 1, 6);

INSERT INTO map_object_object(id_object_up, id_object_down)
VALUES (3,2);

INSERT INTO map_ressource_provider(id_ressource, id_provider)
VALUES (1,2), (2,2);

INSERT INTO map_ressource_terraform(id_ressource, id_terraform)
VALUES (1,2), (2,3), (3,1), (4,4);

INSERT INTO map_ressource_playbook(id_ressource, id_playbook)
VALUES (5,1);