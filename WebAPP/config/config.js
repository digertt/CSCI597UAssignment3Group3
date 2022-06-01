const convict = require('convict');
const convict_format_with_validator = require('convict-format-with-validator');

convict.addFormats(convict_format_with_validator);

// Define a schema
var config = convict({
  env: {
    doc: 'The application environment.',
    format: ['prod', 'dev', 'test'],
    default: 'prod',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8080,
    env: 'PORT',
    arg: 'port'
  },
  redis_port: {
    doc: 'redis port to connect to.',
    format: 'port',
    default: 6379,
    env: 'REDIS_PORT',
    arg: 'redisport'
  },
  redis_host: {
    doc: 'redis hostname',
    format: String,
    default: "redis",
    env: 'REDIS_HOST',
    arg: 'redishost'
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: '*',
      default: 'default',
      env: 'DB_HOST'
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'default',
      env: 'DB_NAME'
    },
    db_url: {
      format: '*',
      default: 'http://localhost:27017/',
      env: 'DB_URL'
    },
    password: {
      doc: 'db password',
      format: '*',
      default: '',
      sensitive: true,
      env: 'DB_PASS'
    },
    port: {
      doc: 'db port',
      format: '*',
      default: '',
      env: 'DB_PORT'
    },
    database: {
      doc: 'db database',
      format: '*',
      default: '',
      env: 'DB_DB'
    }
  },
  sqs: {
    name: {
      doc: 'SQS name',
      format: '*',
      default: 'default',
      env: 'SQS_NAME'
    },
    region: {
      doc: 'SQS region',
      format: '*',
      default: 'default',
      env: 'SQS_REGION'
    },
  },
  ddb: {
    name: {
      doc: 'DynamoDB table name',
      format: '*',
      default: 'default',
      env: 'DDB_NAME'
    },
  },
  secret: {
    doc: 'Secret used for session cookies and CSRF tokens',
    format: '*',
    default: '',
    sensitive: true,
    env: 'SESSION_SECRET'
  },
  test_username: {
    doc: 'Secret used for session cookies and CSRF tokens',
    format: '*',
    default: '',
    sensitive: true,
    env: 'TEST_USER_NAME'
  },
  test_password: {
    doc: 'Secret used for session cookies and CSRF tokens',
    format: '*',
    default: '',
    sensitive: true,
    env: 'TEST_PASSWORD'
  }
  
});

// Load environment dependent configuration
var env = config.get('env');
config.loadFile('./config/' + env + '.json');

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;