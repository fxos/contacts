// UnifiedDiff converts a unified diff patch format into an
// intermediate representation (called ir).
//
// This intermediate representation is here to abstract the update
// format from updates on the content, and let us change the update
// backend in the future.
//
// TODO Parse the first word of each line, instead of multiple regexp.
//      This will support more random keywords.

/* exported UnifiedDiff */
(function(exports) {
  'use strict';

  exports.UnifiedDiff = {
    parse: function(text) {
      var ir = {};

      var nop = function(str) {
        return str;
      };

      var kSchemas = [
        [/^diff\s/, addFile],
        [/^new file mode \d+$/, nop],
        [/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/, nop],
        [/^---\s/, nop],
        [/^\+\+\+\s/, nop],
        [/^@@/, addHunk],
        [/^-/, addDeletion],
        [/^\+/, addAddition],
        [/^From\s/, nop],
        [/^Date\s/, nop],
        [/^Subject\s/, nop],
        [/^---$/, nop]
      ];

      function parse(line) {
        for (var i = 0; i < kSchemas.length; i++) {
          var schema = kSchemas[i];
          if (line.match(schema[0])) {
            schema[1](line);
            return;
          }
        }

        increment();
      }

      var files = {};
      var currentFilename = '';
      var currentPosition = 0;

      text.split('\n').forEach(parse);

      for (var file in files) {
        //console.log(file);

        var operations = files[file].operations;
        operations.forEach(function onEachOperation(op) {
          if (op.type == 'deletion') {
            //console.log('delete line ' + Math.abs(op.lineNumber));
          } else {
            //console.log(
            //  'add line ' +
            //  Math.abs(op.lineNumber) +
            //  '(' + op.content + ')'
            //);
          }
        });
      }

      return files;

      function addFile(line) {
        var filename = line.split(' ')[2].replace('a/', '/contacts/');

        files[filename] = {
          hunks: [],
          operations: []
        };

        currentFilename = filename;
      }

      function addHunk(line) {
        if (!currentFilename) {
          return;
        }

        currentPosition = line.split(' ')[1].split(',')[0].replace('-', '');
        files[currentFilename].hunks.push(line);
      }

      function addDeletion(line) {
        if (!currentFilename) {
          return;
        }

        files[currentFilename].operations.push({
          'type': 'deletion',
          'lineNumber': currentPosition
        });
      }

      function addAddition(line) {
        if (!currentFilename) {
          return;
        }

        files[currentFilename].operations.push({
          'type': 'addition',
          'lineNumber': currentPosition,
          'content': line.replace(/^\+/, '')
        });

        increment();
      }

      function increment() {
        currentPosition++;
      }

      function decrement() {
        currentPosition--;
      }

      return ir;
    }
  };
})(window);
