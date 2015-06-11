/*
 * grunt-get-javascript
 * https://github.com/paipeng/grunt-get-javascript
 *
 * Copyright (c) 2015 Pai Peng
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var multilineTrim = function (htmlString) {
        // split the string into an array by line separator
        var arr = htmlString.split("\n");
        // call $.trim on each line
        arr = arr.map(function (val) {
            if (val.trim() === "") {
                return val.trim();
            } else {
                return val;
            }
        });
        // filter out the empty lines
        arr = arr.filter(function (line) {
                return line != ""
            }
        );
        // join the array of lines back into a string
        return arr.join("\n");
    }

    var removeHTMLCode = function (dest, matchArray, replace, remove_blank_lines, $) {
        grunt.log.subhead('Processing ' + dest.cyan);

        matchArray.forEach(function (option) {
            //console.log("remove " + JSON.stringify(option));
            if (!option.selector || !option.attribute || !option.value) {
                grunt.log.error('remove config missing selector, attribute, and/or value options');
            } else {
                $(option.selector).map(function (i, elem) {
                    if ($(elem).attr(option.attribute) === option.value) {
                        $(elem).remove();
                    }
                });
            }
        });

        if (!replace.selector || !replace.html) {
            grunt.log.error('replace config missing selector, attribute, and/or value options');
        } else {
            $(replace.selector).append(replace.html+"\n");
        }

        var updatedContents = $.html();
        if (remove_blank_lines) {
            updatedContents = multilineTrim(updatedContents);
        }

        grunt.file.write(dest, updatedContents);
        grunt.log.writeln('File ' + (dest ).cyan + ' created/updated.');
    };

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('get_javascript', 'This plugin is used to get included javascript file names (with path)', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            prefix: undefined,
            offset: 0,
            separator: "",
            replace: undefined,
            remove_blank_lines: false,
            config_parameter_name: 'js_filenames'
        });

        var htmlparser = require("htmlparser2");
        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            // Concat specified files.
            var src = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                // Read file source.
                return grunt.file.read(filepath);
            }).join(grunt.util.normalizelf(options.separator));

            // Handle options.
            var js_files = [];

            var parser = new htmlparser.Parser({
                onopentag: function (name, attribs) {
                    if (name === "script" && attribs.src !== undefined) {
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
                ontext: function (text) {
                    //console.log("-->", text);
                },
                onclosetag: function (tagname) {
                    if (tagname === "script") {
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
                matchArray.push({selector: 'script', attribute: 'src', value: js_files[i]});

                js_offset_files.push(js_files[i].substring(options.offset));
            }

            // write script filenames into json file
            grunt.file.write(f.dest, JSON.stringify(js_offset_files));

            grunt.config.set(options.config_parameter_name, js_offset_files);

            if (options.replace !== undefined) {

                f.src.filter(function (filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                }).map(function (filepath) {
                    // Read file source.
                    var src = grunt.file.read(filepath);

                    var cheerio = require('cheerio');
                    var $ = cheerio.load(src, {lowerCaseAttributeNames: false});
                    removeHTMLCode(f.dest, matchArray, options.replace, options.remove_blank_lines, $);
                });
            }
            // Print a success message.
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });

};
