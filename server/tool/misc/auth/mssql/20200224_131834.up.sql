/* xc */
CREATE TABLE users
(
    id                       int IDENTITY (1,1) NOT NULL,
    email                    varchar(45)        NULL,
    created_at               datetime           NULL
        CONSTRAINT DF_users_created_at DEFAULT GETDATE(),
    updated_at               datetime           NULL
        CONSTRAINT DF_users_updated_at DEFAULT GETDATE(),
    password                 varchar(255)       NULL,
    salt                     varchar(255)       NULL,
    firstname                varchar(255)       NULL,
    lastname                 varchar(255)       NULL,
    username                 varchar(255)       NULL,
    roles                    varchar(255)       NULL,
    provider                 varchar(255)       NULL,
    provider_ids             varchar(255)       NULL,
    provider_data            text               NULL,
    provider_data_plus       text               NULL,
    reset_password_token     varchar(255)       NULL,
    reset_password_expires   datetime           NULL,
    email_verification_token varchar(255)       NULL,
    email_verified           tinyint            NULL,
    PRIMARY KEY (id)
);;
/* xc */
CREATE TRIGGER xc_trigger_users_updated_at
    ON users
    AFTER UPDATE
    AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users Set updated_at = GetDate() where id in (SELECT id FROM Inserted)
END;;