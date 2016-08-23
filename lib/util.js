exports.promisify = function(fn, receiver) {
	return function() {
		var args = [].slice.call(arguments).concat();
		return new Promise(function(resolve, reject) {
			fn.apply(receiver, args.concat(function(err, res) {
				err ? reject(err) : resolve(res);
			}));
		})
	}
}

exports.intersection = function(a, b) {
	return a.filter(function(v) {
		return ~b.indexOf(v)
	})
}