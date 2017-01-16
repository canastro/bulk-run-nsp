#!/usr/bin/env node

var program = require('commander');
var updateNotifier = require('update-notifier');
var bulk = require('../src');
var pkg = require('../package.json');

// check if a new version of ncu is available and print an update notification
updateNotifier({ pkg: pkg }).notify({defer: false});

program
    .version(require('../package').version)
    .option('-s, --show-log', 'Show Logs in Console');

program.parse(process.argv);

program.rootPath = process.cwd();
program.cli = true;

bulk(program);
