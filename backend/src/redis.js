const config = require('config');
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(config.get('redis'));

function errorHandler (err) {
  if (err && err.code === 'ECONNREFUSED') {
    return console.error(err.message);
  }

  if (err instanceof redis.AbortError) {
    console.error('AbortError - the process will exit and should be restarted');
    process.exit(1);
  }

  console.error('Redis error', err);
}

client.on('error', (err) => errorHandler(err));

// Promisfy & export required Redis commands
for (const func of [
  // Transactions
  'multi', 'exec', 'discard',
  // Plain keys
  'get', 'set', 'incr',
  // Hashes
  'hget', 'hgetall', 'hset', 'hdel', 'hscan',
  // Sets
  'sadd', 'spop', 'smembers', 'sscan', 'srem',
  // Pubsub
  'publish', 'subscribe',
  // Keys
  'exists'
]) {
  exports[func] = promisify(client[func].bind(client));
}

exports.client = client;
exports.errorHandler = errorHandler;
