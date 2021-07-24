# This is the Database Generation MySQL file

create database sample_schema;

use sample_schema;

create table server_key_table
(
    `public_key_1`      varchar(1024) null,
    `private_key_1`     varchar(1024) null,
    `public_key_2`      varchar(1024) null,
    `private_key_2`    varchar(1024) null,
    `client_public_key` varchar(1024) null,
    `row_id`           int auto_increment,
    constraint server_key_table_pk
        unique (row_id)
);

alter table server_key_table
    add primary key (row_id);

create table user_table
(
    `email`  varchar(100) not null primary key,
    `password` varchar(100) not null
);