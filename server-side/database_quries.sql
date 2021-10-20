create table server_key_table
(
    public_key_1      text null,
    private_key_1     text null,
    public_key_2      text null,
    private_key_2     text null,
    client_public_key text null,
    row_id            int auto_increment,
    constraint server_key_table_pk
        unique (row_id)
);

alter table server_key_table
    add primary key (row_id);

create table user_table
(
    email       varchar(100) not null
        primary key,
    password    text         not null,
    firstname   text         null,
    lastname    text         null,
    generalUser tinyint(1)   not null
);
