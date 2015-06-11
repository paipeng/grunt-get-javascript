'use strict';

var grunt = require('grunt');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports.get_javascript = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },
    html_options: function (test) {
        test.expect(2);

        var actual = grunt.file.read('tmp/html_options');
        var expected = grunt.file.read('test/expected/html_options');
        test.equal(actual, expected, 'should describe what the default behavior is.');

        test.equal(JSON.stringify(grunt.config.get("js")),
            '["/bower_components/jquery/dist/jquery.min.js","/bower_components/angular/angular.js","/bower_components/angular-touch/angular-touch.min.js","/bower_components/angular-bootstrap/ui-bootstrap-tpls.js"]',
            "get css files should be same");

        test.done();
    }
};
