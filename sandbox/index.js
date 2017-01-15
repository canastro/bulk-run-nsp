const bulkRunNsp = require('../src/index');

const config = {
    rootPath: '/Users/ricardocanastro/dev/personal',
    showLog: true
};

bulkRunNsp(config).then((files) => {
    console.log('Projects scanned: ', JSON.stringify(files));
});
