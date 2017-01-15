const bulkRunNsp = require('../src/index');

const config = {
    rootPath: '/Users/ricardocanastro/dev',
    showLog: true
};

const bulk = bulkRunNsp(config);
bulk.on('data', (report) => {
    console.log('--------------');
    console.log('when: ', new Date());
    console.log('isVulnerable: ', report.isVulnerable);
    console.log('--------------');
});

bulk.on('error', (err) => {
    console.log('--------------');
    console.log('when: ', new Date());
    console.log('error: ', err);
    console.log('--------------');
});

bulk.on('end', () => {
    console.log('end');
});
