![build status](https://travis-ci.org/canastro/bulk-run-nsp.svg?branch=master)
[![npm version](https://badge.fury.io/js/bulk-run-nsp.svg)](https://badge.fury.io/js/bulk-run-nsp)
[![codecov](https://codecov.io/gh/canastro/bulk-run-nsp/branch/master/graph/badge.svg)](https://codecov.io/gh/canastro/bulk-run-nsp)

# bulk-run-nsp
Small library that will find all directories in a rootPath with a `package.json` file and will run nsp (Node Security Project) on it.

## Why?
I had a lot of old projects that I didn't worked for a while and I was running out of free space on my disk. I ran a command that would delete all the `node_modules` folders in a given rootPath and I "instantly" gained 20GB of free disk.

After that I thought I should have a better way to deal with this and started creating a electron app to manage my workspace. I gathered some features I would like to have and started coding some core modules to later use in the electron app, such as:
* [query-paths](https://github.com/canastro/query-paths)
* [remove-git-ignored](https://github.com/canastro/remove-git-ignored)
* [bulk-run-nsp](https://github.com/canastro/bulk-run-nsp)

## How it works?
This module uses [query-paths](https://github.com/canastro/query-paths) to recursively find all the folders with a package.json file. Then it runs `nsp` and returns the json format from nsp in a object with the following structure:
```json
{
    "isVulnerable": true,
    "projectPath": "/users/username/project",
    "results": []
}
```
Being the array results the output of the `json` formatter of nsp module.

If you pass `showLog` config as true, then you'll get a command line output in a table like structure, just as the one default formatter from `nsp`.

## Usage

### As cli
```js
> npm i -g bulk-run-nsp

# Go to the desired root folder
> bulk-nsp -s

# You can output the log into a file
> bulk-nsp -s > output.txt
```

### As a node module
```js
const bulkRunNsp = require('bulk-run-nsp');

const bulk = bulkRunNsp({ rootPath: '/Users/username/dev', showLog: true });
bulk.on('data', (report) => {
    console.log('report received for: ', report.projectPath);
});

bulk.on('error', (report) => {
    console.log('error received: ', report.error, ' for: ', report.projectPath);
});

bulk.on('end', () => {
    console.log('end');
});
```
