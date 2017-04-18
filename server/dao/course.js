const monet = require('monet');
const Promise = require('bluebird');
require('../../lib/database-helper.js')(Promise, monet);
const Maybe = monet.Maybe;
const Either = monet.Either;

module.exports = models => ({
  findByUser(user) {
    return null;
  },
  findByCourseId(id) {
    return models.pool.query('SELECT * FROM course WHERE id = ?', [id])
      .then(result => Either.Right(result.affectedRows))
      .errorToLeft();
  },
  findByCourseIds(ids) {
    return Promise.all(ids.map(id => this.findByCourseId(id)));
  }
});
