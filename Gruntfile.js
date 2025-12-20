module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: false,
          optimization: 2,
          sourceMap: true,
          sourceMapFilename: 'css/Донер.css.map'
        },
        files: {
          'css/Донер.css': 'Донер.less'
        }
      },
      production: {
        options: {
          compress: true,
          optimization: 2,
          cleancss: true
        },
        files: {
          'css/Донер.min.css': 'Донер.less'
        }
      }
    },
    
    watch: {
      styles: {
        files: ['Донер.less'],
        tasks: ['less:development'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      scripts: {
        files: ['js/main.js', 'js/products.json'],
        options: {
          livereload: true
        }
      },
      html: {
        files: ['*.html'],
        options: {
          livereload: true
        }
      }
    },
    
    clean: {
      css: ['css/*.css', 'css/*.map']
    },
    
    copy: {
      images: {
        files: [
          {
            expand: true,
            src: ['images/**'],
            dest: 'dist/'
          }
        ]
      }
    },
    
    cssmin: {
      target: {
        files: {
          'css/Донер.min.css': ['css/Донер.css']
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  
  grunt.registerTask('default', ['less:development']);
  grunt.registerTask('build', ['clean:css', 'less:production', 'cssmin', 'copy']);
  grunt.registerTask('dev', ['default', 'watch']);


  
};