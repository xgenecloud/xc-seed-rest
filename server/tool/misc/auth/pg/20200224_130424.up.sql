/* xc */
CREATE TABLE users ( id serial, email character varying NULL, created_at timestamp NULL DEFAULT now(), updated_at timestamp NULL DEFAULT now(), password character varying NULL, salt character varying NULL, firstname character varying NULL, lastname character varying NULL, username character varying NULL, roles character varying NULL, provider character varying NULL, provider_data text NULL, provider_data_plus text NULL, provider_ids character varying NULL, reset_password_token character varying NULL, reset_password_expires timestamp NULL, email_verification_token character varying NULL, email_verified bool NULL, PRIMARY KEY(id));;/* xc */
CREATE OR REPLACE FUNCTION xc_auto_update_timestamp_users_updated_at()
                          RETURNS TRIGGER AS $$
                          BEGIN
                            NEW.updated_at = NOW();
                            RETURN NEW;
                          END;
                          $$ LANGUAGE plpgsql;/* xc */
CREATE TRIGGER xc_trigger_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE PROCEDURE xc_auto_update_timestamp_users_updated_at();;