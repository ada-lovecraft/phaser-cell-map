// Generated on 2014-03-28 using generator-phaser-official 0.0.8-rc-2
'use strict';
var config = require('./config.json');
var _ = require('underscore');
_.str = require('underscore.string');
var markdown = require('markdown').markdown;
var parseString = require('xml2js').parseString;
var os = require('os');
var ifaces = os.networkInterfaces();

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};
 
module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
 
  grunt.initConfig({
    watch: {
      scripts: {
        files: [
            'game/**/*.js',
            '!game/main.js',
            'assets/**',
            'css/**',
            'index.html'
        ],
        options: {
          spawn: false,
          livereload: LIVERELOAD_PORT
        },
        tasks: ['build']
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:9000'
      },
      cocoon: {
        path: 'http://localhost:9000/cocoon/index.html'
      },

    },
    copy: {
      dist: {
        files: [
          // includes files within path and its sub-directories
          { expand: true, src: ['assets/**'], dest: 'dist/' },
          { expand: true, flatten: true, src: ['game/plugins/*.js'], dest: 'dist/js/plugins/' },
          { expand: true, flatten: true, src: ['bower_components/**/build/*.js'], dest: 'dist/js/' },
          { expand: true, flatten: true, src: ['bower_components/**/build/*.js'], dest: 'dist/js/' },
          { expand: true, flatten: true, src: ['bower_components/lodash/dist/lodash.min.js'], dest: 'dist/js/' },
          { expand: true, src: ['css/**'], dest: 'dist/' },
          { expand: true, src: ['index.html'], dest: 'dist/' },
          { expand: true, src: ['cocoon/**'], dest: 'dist/'}
        ]
      }
    },
    browserify: {
      build: {
        src: ['game/main.js'],
        dest: 'dist/js/game.js'
      }
    }, 
    compress: {
      prod: {
        options: {
          archive: 'dist/' + _.slugify(config.projectName) + '.zip'
        },
        files: [
          { expand: true, cwd: 'dist/', src: ['**', '!cocoon/**'], dest:'./'}
        ]
      }
    },
    clean: ['dist/']
  });
  
  grunt.registerTask('build', ['clean','buildBootstrapper', 'browserify','copy','buildFontJSON','compress:prod', 'buildQR']);
  grunt.registerTask('serve', ['build', 'connect:livereload', 'open:server', 'watch']);
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('cocoon', ['build', 'connect:livereload','open:cocoon', 'watch']);


  grunt.registerTask('buildBootstrapper', 'builds the bootstrapper file correctly', function() {
    var stateFiles = grunt.file.expand('game/states/*.js');
    var gameStates = [];
    var statePattern = new RegExp(/(\w+).js$/);
    stateFiles.forEach(function(file) {
      var state = file.match(statePattern)[1];
      if (!!state) {
        gameStates.push({shortName: state, stateName: _.capitalize(state) + 'State'});
      }
    });
    config.gameStates = gameStates;
    console.log(config);
    var bootstrapper = grunt.file.read('templates/game/_main.js.tpl');
    bootstrapper = grunt.template.process(bootstrapper,{data: config});
    grunt.file.write('game/main.js', bootstrapper);
  });

  grunt.registerTask('buildQR', 'builds the qrcode page', function() {
    var qrPage = grunt.file.read('templates/cocoon/_index.html.tpl');
    config.localServer = {};
    for(var dev in ifaces) {
      if(dev != "en1" && dev != "en0") {
        continue;
      }
      ifaces[dev].forEach(function(details) {
        if(details.family == 'IPv4') {
          config.localServer.ip = details.address;
          config.localServer.port = grunt.config.get('connect').options.port; 
        }
      }, this);
    }
    console.dir(config.localServer);
    grunt.file.write('dist/cocoon/index.html', grunt.template.process(qrPage, {data: config }));
  });

  grunt.registerTask('buildFontJSON', 'builds font json file', function() {
    var fontFiles = grunt.file.expand(['assets/fonts/**/*.xml','assets/fonts/**/*.fnt']);
    console.dir(fontFiles);
    fontFiles.forEach(function(file) {
      console.dir(file);
      var fontXML = grunt.file.read(file);
      parseString(fontXML, function(err, result) {
        if(err) {
          throw err;
        } 
        grunt.file.write('dist/' + file.split('.')[0] + '.json', JSON.stringify(result.font));
      });  
    });
    
  });
};