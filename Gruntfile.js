'use strict';

module.exports = function(grunt) {

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	clean: {
		dist: {
			src: ['index.html']
		}
	},
	jshint: {
		options: {
			globals: {
				console: true,
				module: true
			},
			"-W099": true,	//ignora tabs e space warning
			"-W033": true,
			"-W044": true	//ignore regexp
		},
		files: ['src/leaflet.geojson.encoded.js']
	},
	uglify: {
		dist: {
			files: {
				'dist/leaflet.geojson.encoded.min.js': ['src/leaflet.geojson.encoded.js'],
				'dist/leaflet.geojson.encoded.encoder.min.js': ['src/leaflet.geojson.encoded.encoder.js']
			}
		}
	},	
	markdown: {
		readme: {
			files: {
				'index.html': ['README.md']
			}
		}
	}
});

grunt.registerTask('default', [
	'clean',
	'jshint',
	'uglify',
	'markdown'
]);

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-markdown');
};