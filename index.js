#! /usr/bin/env node

'use strict'
var program = require('commander');
var pkg = require('./package.json');
var deps = require('./lib/');

program
	.version(pkg.version);

program
	.command('install [name]')
	.description('Install a package and any packages that it depends on.')
	.option('-S, --save', 'Package will appear in your dependencies.')
	.action(deps.installDep)

program
	.parse(process.argv);