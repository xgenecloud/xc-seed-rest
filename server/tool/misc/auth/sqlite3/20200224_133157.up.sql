/* xc */
CREATE TABLE users (id integer  NOT NULL,email varchar(255)  ,created_at datetime DEFAULT CURRENT_TIMESTAMP ,updated_at datetime DEFAULT CURRENT_TIMESTAMP ,password varchar(255)  ,salt varchar(255)  ,username varchar(255)  ,firstname varchar(255)  ,lastname varchar(255)  ,roles varchar(255)  ,provider varchar(255)  ,provider_data text  ,provider_data_plus text  ,provider_ids varchar(255)  ,reset_password_token text  ,reset_password_expires datetime  ,email_verification_token varchar(255)  ,email_verified boolean  , PRIMARY KEY(id));;/* xc */
CREATE TRIGGER xc_trigger_users_updated_at
            AFTER UPDATE
            ON users FOR EACH ROW
            BEGIN
              UPDATE users SET updated_at = current_timestamp
                WHERE id = old.id;
            END;;