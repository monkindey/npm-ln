/**
 * feature
 * 1. 已安装目录下有对应的安装包就实现软链接，没有就原生npm install
 * 2. 是否支持npm install部分参数
 * (1). --save
 * (2). --save-dev
 */
'use strict'

var fs = require('fs');
var cp = require('child_process');
var path = require('path');

var config = require('../config.js');
var INSTALLED_PATH = config.INSTALLED_PATH;
var NODE_MODULES_PATH = config.NODE_MODULES_PATH;

var utilExtra = require('./util.js');
var promisify = utilExtra.promisify;

var pkg = require(process.cwd() + '/package.json');
var deps = pkg.dependencies;
var depsName = Object.keys(deps);

var readdirPm = promisify(fs.readdir, fs);
var statPm = promisify(fs.stat, fs);

function installDep(pkgName, cmd) {
	var installedPkg = getInstalledPkg();
	var pkgPath;

	// 检查是否存在node_modules目录，没有的话应该新建一个
	statPm(NODE_MODULES_PATH).then(function(stat) {
		// console.log(stat.isDirectory());
	}, function(err) {
		if (err.code == 'ENOENT') {
			fs.mkdir(NODE_MODULES_PATH);
		}
	}).then(function() {
		if (pkgName) {
			// npm install [pkg] 或者 npm install --save [pkg]
			if (~installedPkg.indexOf(pkgName)) {
				pkgPath = path.resolve(INSTALLED_PATH, pkgName);
				dealOptions(pkgName, cmd);
				execSoftLn(pkgPath, NODE_MODULES_PATH);
			} else {
				execNativeInstall(pkgName, getOption(cmd));
			}
		} else {
			// npm install
			depsName.forEach(function(pkgName) {
				pkgPath = path.resolve(INSTALLED_PATH, pkgName);
				// 已经安装的包有了
				if (~installedPkg.indexOf(pkgName)) {
					execSoftLn(pkgPath, NODE_MODULES_PATH);
				} else {
					execNativeInstall(pkgName);
				}
			});
		}

	})
}

// if else 不太适合扩展
function getOption(cmd) {
	if (cmd.save) {
		return '--save'
	} else if (cmd.saveDev) {
		return '--save-dev'
	}
}

function dealOptions(pkgName, cmd) {
	getInstalledPkgVersion(pkgName).then(function(version) {
		var pkgExtra = Object.assign({}, pkg);
		var pkgJSON = '';
		// --save
		if (cmd.save) {
			pkgExtra.dependencies[pkgName] = version;
		}

		// --save-dev
		if (cmd.saveDev) {
			pkgExtra.devDependencies[pkgName] = version;
		}
		// 格式化
		pkgJSON = JSON.stringify(pkgExtra, null, 2) + '\n';
		fs.writeFile(process.cwd() + '/package.json', pkgJSON, function(err) {
			if (err) {
				throw err;
			}
		})
	})
}

function getInstalledPkgVersion(pkgName) {
	var installedPkgPath = path.resolve(NODE_MODULES_PATH, 'package.json');
	var pkgVersion;

	// 如果存在package.json，就在package.json里面获取版本号
	return statPm(installedPkgPath).then(function() {
		pkgVersion = require(installedPkgPath).dependencies[pkgName];
		return Promise.resolve(pkgVersion);
	}, function(err) {
		pkgVersion = require(path.resolve(INSTALLED_PATH, pkgName, 'package.json')).version;
		return Promise.resolve(pkgVersion);
	})
}

function getInstalledPkg() {
	return fs.readdirSync(INSTALLED_PATH).filter(function(pkg) {
		return pkg != '.bin'
	})
}

function execNativeInstall(pkgName, option) {
	if (option) {
		cp.exec('npm install ' + option + ' ' + pkgName);
	} else {
		cp.exec('npm install ' + pkgName);
	}
}

// 软链接
function execSoftLn(src, dist) {
	var execPm = promisify(cp.exec, cp);
	return execPm('ln -s ' + src + ' ' + dist);
}

exports.installDep = installDep;