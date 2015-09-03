exports.config = {
	modules: {
		definition: false,
		wrapper: false
	},
	paths: {
		watched: ['app'],
		'public' : './public' 
	},
    files: {
        javascripts: {
			joinTo: 'js/app.js'
		}
	}
}