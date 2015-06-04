/*
 * grunt-get-javascript
 * https://github.com/paipeng/grunt-get-javascript
 *
 * Copyright (c) 2015 Pai Peng
 * Licensed under the MIT license.
 */

'use strict';

var cheerio = require('cheerio');
module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('get_javascript', 'This plugin is used to get included javascript file names (with path)', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      prefix: undefined,
        offset: 0,
        separator: "",
        replace: undefined
    });

      var removeHTMLCode = function(dest, matchArray, replace, $){
          grunt.log.subhead('Processing ' + dest.cyan);

          matchArray.forEach(function(option) {
              //console.log("remove " + JSON.stringify(option));
              if (!option.selector || !option.attribute || !option.value){
                  grunt.log.error('remove config missing selector, attribute, and/or value options');
              } else {
                  $(option.selector).map(function(i,elem){
                      if ($(elem).attr(option.attribute) === option.value) {
                          $(elem).remove();
                      }
                  });
              }
          });

          if (!replace.selector || !replace.html){
              grunt.log.error('replace config missing selector, attribute, and/or value options');
          } else {
              $(replace.selector).append(replace.html);
          }

          var updatedContents = $.html();
          grunt.file.write(dest, updatedContents);
          grunt.log.writeln('File ' + (dest ).cyan + ' created/updated.');

      };


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

                            js_files.push(attribs.src);
                        }
                    } else {
                        js_files.push(attribs.src);

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

        parser.write(src);
        parser.end();


        var js_offset_files = [];
        var matchArray = [];
        for (var i in js_files) {
            matchArray.push({selector:'script',attribute:'src',value:js_files[i]});

            js_offset_files.push(js_files[i].substring(options.offset));
        }

        // write script filenames into json file
        grunt.file.write(f.dest, JSON.stringify(js_offset_files));

        if (options.replace !== undefined) {

            f.src.filter(function(filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                // Read file source.
                var src = grunt.file.read(filepath);

                var $ = cheerio.load(src,{lowerCaseAttributeNames:false});
                removeHTMLCode(filepath, matchArray, options.replace, $);

            });


        }

      //src += options.punctuation;

      // Write the destination file.
      //grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
