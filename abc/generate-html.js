const files = ["order", "price-availability", "shopping-cart", "product-search"];

const replace = require('replace-in-file');
const cpFile = require('cp-file');
files.forEach(function(fileName) {
	(async () => {
		var file = 'build/' + fileName + '.html';
		await cpFile('build/index.html', file);
		await replace({files: file, from: 'var redirect;', to: 'var redirect="#/' + fileName + '";'});
	})();
});