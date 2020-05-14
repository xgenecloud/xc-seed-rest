module.exports = {
  tableName: 'users',
  columns: [{
      columnName: 'id',
      type: 'integer',
      dataType: 'int',
      notNull: true,
      unsigned: true,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'email',
      type: 'string',
      dataType: 'varchar',
      notNull: true,
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'password',
      type: 'string',
      dataType: 'varchar',
      notNull: true,
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'salt',
      type: 'string',
      dataType: 'varchar',
      notNull: true,
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'firstname',
      type: 'string',
      dataType: 'varchar',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'lastname',
      type: 'string',
      dataType: 'varchar',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'username',
      type: 'string',
      dataType: 'varchar',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'roles',
      type: 'string',
      dataType: 'varchar',
      default: "user",
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'created_at',
      type: 'timestamp',
      dataType: 'timestamp',
      default: "CURRENT_TIMESTAMP",
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'updated_at',
      type: 'timestamp',
      dataType: 'timestamp',
      default: "CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP",
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'provider',
      type: 'string',
      dataType: 'varchar',
      default: "local",
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'provider_data',
      type: 'text',
      dataType: 'mediumtext',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'provider_data_plus',
      type: 'text',
      dataType: 'mediumtext',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'provider_ids',
      type: 'string',
      dataType: 'varchar',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'reset_password_token',
      type: 'string',
      dataType: 'varchar',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'reset_password_expires',
      type: 'timestamp',
      dataType: 'timestamp',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'email_verification_token',
      type: 'string',
      dataType: 'varchar',
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
    {
      columnName: 'email_verified',
      type: 'integer',
      dataType: 'tinyint',
      default: "0",
      validate: {
        func: [],
        args: [],
        msg: []
      },
    },
  ],
  pks: [],
  hasMany: [],
  belongsTo: []
}