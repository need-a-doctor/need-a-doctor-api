'use strict';

// Export the mongoose plugin
module.exports = function uniqueValidator (schema, options) {
  options = options || {};

  var message = options.message ||
    'Error, expected `{PATH}` to be unique. Value: `{VALUE}`';

  schema.indexes().forEach(function (index) {
    var paths = Object.keys(index[0]);
    var indexOptions = index[1];

    if (indexOptions.unique) {
      paths.forEach(function (pathName) {
        var pathMessage = message;
        if (typeof indexOptions.unique === 'string') {
          pathMessage = indexOptions.unique;
        }

        var path = schema.path(pathName);

        if (path) {
          path.validate(function validator (value, respond) {
            var doc = this;

            var conditions = [];
            paths.forEach(function (name) {
              var pathValue = doc.get(name);

              // Wrap with case-insensitivity
              if (path.options && path.options.uniqueCaseInsensitive) {
                pathValue = new RegExp('^' + pathValue + '$', 'i');
              }

              var condition = {};
              condition[name] = pathValue;

              conditions.push(condition);
            });

            // Obtain the model depending on context
            // https://github.com/Automattic/mongoose/issues/3430
            var model;
            if (doc.constructor.name === 'Query') {
              model = doc.model;
            } else {
              model = doc.model(doc.constructor.modelName);
            }

            model
              .where({$and: conditions})
              .exec(function (err, docs) {
                if (!docs[0]) {
                  return respond(true);
                }

                return respond(docs[0].equals(doc));
              });
          }, pathMessage);
        }
      });
    }
  });
};
