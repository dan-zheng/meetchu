module.exports = (Promise, monet) => {
/*
  Object.prototype.cons = function (list) {
      return list.cons(this)
  };

  Object.prototype.some = Object.prototype.just = function () {
      return new monet.Some(this)
  };

  Object.prototype.success = function () {
      return monet.Validation.success(this)
  };

  Object.prototype.fail = function () {
      return monet.Validation.fail(this)
  };

  Object.prototype.right = function() {
      return monet.Either.Right(this)
  };

  Object.prototype.left = function() {
      return monet.Either.Left(this)
  };
*/
  Promise.prototype.flatMap = function (mapper, options) {
    return this.then(val => Promise.map(mapper, options)
      .reduce((prev, curr) => prev.concat(curr), []));
  };

  Promise.prototype.errorToLeft = function () {
    return this.catch((err) => {
      console.error(err.message, err.stack);
      return monet.Either.Left('A database error occured.');
    });
  };

  Array.prototype.list = function () {
    return monet.List.fromArray(this);
  };
};
