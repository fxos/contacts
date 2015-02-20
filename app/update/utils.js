// UpdateUtils take a update url which point to an update file format.
// Ideally this patch format will be a intermediate representation
// of the logical operations that should applies on a per file basis.
//
// The intermediate representation is designed to be as small
// as possible, while easily readable/extendable.
//
// This is a json file following the rules:
// {
//   "absolute_file_path_1": [
//     0: some_binary_diff,
//     -1: "line content to delete at line 1",
//     2: "line content to add at line 2"
//   },
//   "absolute_file_path_2": {
//     ...
//   }
// }
//
// TODO Ensure unified diffs follows the defined format for
//      intermediate representation.
//      Also IIRC iterating on an object does not guarantee the
//      ordering, which will means the format should be a little
//      bit more complex in this case (or maybe not a json object).
//
// For the moment, UpdateUtils supports only unified diff format.
// Once more format would be supported it would be nice to have
// a file format detector, in order to load and use only the
// correct format parser.
//

/* global UnifiedDiff */

/* exported UpdateUtils */

(function(exports) {
  'use strict';

  exports.UpdateUtils = {
    apply: function uu_apply(updateContent) {
      var ir = UnifiedDiff.parse(updateContent);
      return this._applyIR(ir);
    },

    _applyIR: function uu_applyIR(ir) {
      // TODO
      // Returning an object is not really ideal since the object will
      // will likely be passed to an other execution context and then
      // copied.
      // It is even worse in chrome, since a new Worker can not be
      // spawned inside the ServiceWorker because of a platform issue.
      // See https://code.google.com/p/chromium/issues/detail?id=31666
      // And so the Update worker will be launched by one of the
      // service worker controlled web page. So it will be one copy to
      // pass the data back to the page, and then one copy to pass the
      // data from the page to the service worker...
      //
      // So ideally, returning an ArrayBuffer would be more efficient
      // in all cases. But for now, I'm a bit lazy to define a format
      // for it and fix all the layers of the protocol helper.
      var rv = {};

      for (var filename in ir) {
        var operations = ir[filename].operations;
        var content = this.getFileContent(filename);
        rv[filename] = this._applyIRForContent(operations, content);
      }

      return rv;
    },

    _applyIRForContent: function uu_applyIRForFile(operations, content) {
      // TODO Do some sanity checks, to see if operations applies
      // correctly based on the content of a specific line.

      var lines = content.split('\n');

      operations.forEach(function onEachOperation(operation) {
        switch (operation.type) {
          case 'deletion':
            lines.splice(operation.lineNumber - 1, 1);
            break;

          case 'addition':
            lines.splice(operation.lineNumber - 1, 0, operation.content);
            break;
        }
      });

      return lines.join('\n');
    },

    getFileContent: function uu_getFileContent(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();

      return xhr.responseText;
    }
  };
})(window);
