const monet = require('monet');
require('../../lib/monet-pimp.js')(monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  findByUser(user) {
    return models.pool.query(``);
  }
});
