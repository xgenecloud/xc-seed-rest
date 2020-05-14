/* xc */
DROP TRIGGER IF EXISTS xc_trigger_users_updated_at ON users;/* xc */
DROP FUNCTION IF EXISTS xc_auto_update_timestamp_users_updated_at();/* xc */
drop table "users";