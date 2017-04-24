const algoliasearch = require('algoliasearch');

const client = algoliasearch(
  process.env.ALGOLIA_ID,
  process.env.ALGOLIA_ADMIN_KEY,
  { protocol: 'https:' }
);

module.exports.client = client;
module.exports.index = {};
module.exports.index.courses = client.initIndex('courses');
module.exports.index.chats = client.initIndex('chats');
module.exports.index.users = client.initIndex('users');

const handleError = (err) => {
  console.error(err.message, err.stack);
};

module.exports.add = (index, object) => index.addObject(object).catch(err => handleError(err));
module.exports.update = (index, object) => index.saveObject(object).catch(err => handleError(err));
module.exports.remove = (index, object) => index.deleteObject(object).catch(err => handleError(err));
