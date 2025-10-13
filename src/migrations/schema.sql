-- Create user table
create table if not exists user (
    id integer primary key autoincrement,
    username varchar(50) unique not null,
    password_hash varchar(255) not null,
    email varchar(255) unique not null,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp
);

-- Create trigger to automatically update updated_at timestamp for user
create trigger if not exists update_user_timestamp 
    after update on user
    for each row
    begin
        update user set updated_at = current_timestamp where id = new.id;
    end;

-- Create session table
create table if not exists session (
    id text primary key,
    user_id integer not null,
    expires_at datetime not null,
    created_at datetime default current_timestamp,
    foreign key (user_id) references user(id) on delete cascade
);

-- Create link table (shared link data)
create table if not exists link (
    id integer primary key autoincrement,
    normalized_url text unique not null,
    -- Includes subdomains
    -- host varchar(255),
    -- tld varchar(255),
    -- Root domain
    -- domain varchar(255),
    -- path varchar(255),
    -- query string after ?
    -- query varchar(255),
    -- fragment after #
    -- fragment varchar(255),
    created_at datetime default current_timestamp
);

-- Append only log of shared links
create table if not exists post (
    id integer primary key autoincrement,
    -- user_id integer not null,
    link_id integer not null,
    url text not null,
    created_at datetime default current_timestamp,
    -- foreign key (user_id) references user(id) on delete cascade,
    foreign key (link_id) references link(id) on delete cascade
);