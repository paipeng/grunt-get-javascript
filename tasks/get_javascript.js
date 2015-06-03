/*
 * grunt-get-javascript
 * https://github.com/paipeng/grunt-get-javascript
 *
 * Copyright (c) 2015 Pai Peng
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('get_javascript', 'This plugin is used to get included javascript file names (with path)', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      prefix: undefined,
        offset: 0,
        separator: ""
    });

      var htmlparser = require("htmlparser2");


    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
        var js_files = [];

        var parser = new htmlparser.Parser({
            onopentag: function(name, attribs){
                if(name === "script" && attribs.src !== undefined){
                    if (options.prefix !== undefined) {
                        if (attribs.src.indexOf(options.prefix) == 0) {
                            //console.log("prefix " + options.prefix);

                            js_files.push(attribs.src.substring(options.offset));
                        }
                    } else {
                        js_files.push(attribs.src.substring(options.offset));

                    }


                }
            },
            ontext: function(text){
                //console.log("-->", text);
            },
            onclosetag: function(tagname){
                if(tagname === "script"){
                    //console.log("That's it?!");
                    //console.log(js_files);
                }
            }
        });
//        grunt.log.debug(src);


        parser.write(src);
        parser.end();

        //console.log("end " + js_files);

/*
        // for-in loop
        var j = "";
        for (var i in js_files) {
            //console.log(js_files[i]); //"aa", bb", "cc"

            j += js_files[i] + "\n";
        }
        */
        grunt.file.write(f.dest, JSON.stringify(js_files));

      //src += options.punctuation;

      // Write the destination file.
      //grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
