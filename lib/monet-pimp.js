module.exports = (monet) => {
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

  Array.prototype.list = function () {
      return monet.List.fromArray(this)
  };
};
