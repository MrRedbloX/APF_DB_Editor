CREATE TABLE tenant_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	tenant_region varchar(50) NOT NULL,
	tenant_name varchar(50) NOT NULL
);

CREATE TABLE quota_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	quota_type varchar(50) NOT NULL,
	quota_used varchar(50) NOT NULL,
	quota_quota varchar(50) NOT NULL,
	tenant_uuid INT references tenant_table
);


CREATE TABLE vpc_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	vpc_name varchar(50) NOT NULL,
	tenant_uuid INT references tenant_table
);

CREATE TABLE kp_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	kp_name varchar(50) NOT NULL,
	tenant_uuid INT references tenant_table
);

CREATE TABLE subnet_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	subnet_name varchar(50) NOT NULL,
	subnet_cidr varchar(50) NOT NULL,
	tenant_uuid INT references tenant_table
);

CREATE TABLE ecs_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	ecs_name varchar(50) NOT NULL,
	ecs_id varchar(50) NOT NULL,
	tenant_uuid INT references tenant_table
);

CREATE TABLE SG_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	sg_name varchar(50) NOT NULL,
	tenant_uuid INT references tenant_table
);

CREATE TABLE rule_table(
	uuid SERIAL PRIMARY KEY NOT NULL,
	direction varchar(50) NOT NULL,
	ethertype varchar(50) NOT NULL,
	protocol varchar(50) NOT NULL,
	port_range_min INT,
	port_range_max INT,
	remote_ip_prefix varchar(50) NOT NULL,
	sg_uuid INT references SG_table
);


INSERT INTO tenant_table(tenant_region, tenant_name)
VALUES ('as-south-0','ocb0001888'), 
('eu-west-0','ocb0001888'), 
('eu-west-0','ocb0001079'), 
('as-south-0','ocb0001079'), 
('as-south-0','ocb0001022'),  
('eu-west-0','ocb0001022');

INSERT INTO vpc_table(vpc_name, tenant_uuid)
VALUES ('VPC_test',1), 
('VPC_test_1',1), 
('VPC_test_2',2), 
('VPC_test_3',3), 
('VPC_test_4',4),  
('VPC_test_5',5),
('VPC_test_6',5),
('VPC_test_7',5),
('VPC_test_8',5);


INSERT INTO kp_table(kp_name, tenant_uuid)
VALUES ('kp_test_10',6), 
('kp_test_1',1), 
('kp_test_3',2), 
('kp_test_88',1), 
('kp_test_78',1),  
('kp_test_6',4),
('kp_test_40',6),
('kp_test_9',4),
('kp_test_8',3);

INSERT INTO subnet_table(subnet_name, subnet_cidr, tenant_uuid)
VALUES ('subnet_test_00', '10.25.6.1/24', 1),
('subnet_test_01', '10.25.6.1/24', 5),
('subnet_test_02', '254.22.36.1/24', 6),
('subnet_test_03', '65.29.36.88/26', 4),
('subnet_test_04', '96.62.35.45/28', 3),
('subnet_test_05', '21.65.55.33/22', 3);

INSERT INTO ecs_table(ecs_name, ecs_id, tenant_uuid)
VALUES ('ECS_test', '1234-4567-8975-1234', 1),
('ECS_test_1', '4657-5763-7856-2796', 2),
('ECS_test_2', '4276-3245-7864-0212', 3),
('ECS_test_3', '8697-2753-5758-2543', 4),
('ECS_test_4', '2897-2345-3689-3129', 5),
('ECS_test_5', '1572-2696-5464-7863', 5);

INSERT INTO SG_table(sg_name, tenant_uuid)
VALUES ('SG_1', 4),
('SG_2', 1),
('SG_3', 2),
('SG_4', 3);

INSERT INTO rule_table(direction, ethertype, protocol, port_range_min, port_range_max, remote_ip_prefix, sg_uuid)
VALUES ('egress', 'IPv6', 'NULL', -1, -1, 'NULL' 3),
('ingress', 'IPv4', 'tcp', 443, 443, '10.104.7.19/32' 1),
('egress', 'IPv6', 'udp', 123, 123, '160.222.232.21/32' 2),
('egress', 'IPv4', 'NULL', -1, -1, '82.138.128.0/18' 4),
('egress', 'IPv6', 'NULL', -1, -1, '198.36.64.0/19' 3),
('egress', 'IPv6', 'tcp', 10082, 10082, '10.71.16.32/27' 1);





