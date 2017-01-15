'use strict';

const exec = require('child_process').exec;
const path = require('path');
const events = require('events');
const chalk = require('chalk');
const Table = require('cli-table');
const queryPaths = require('query-paths');

/**
 * Run nsp for a given path
 * @method  run
 * @param   {String} nspBasePath - path where nsp executable can be found
 * @param   {String} projectPath
 * @returns {Object}
 */
const run = (nspBasePath, projectPath) => new Promise((resolve) => {
    exec(`${nspBasePath} check --output json`, { cwd: projectPath }, (error, stdout, stderr) => {
        if (!error) {
            return resolve({ projectPath, isVulnerable: false });
        }

        try {
            const result = JSON.parse(stderr);
            return resolve({
                projectPath,
                isVulnerable: true,
                result
            });
        } catch (e) {
            return resolve({
                projectPath,
                error: stderr
            });
        }
    });
});

/**
 * Get table width
 * @method  getWidth
 * @returns {Number} Table width
 */
const getWidth = () => {
    if (process.stdout.isTTY) {
        return process.stdout.getWindowSize()[0] - 10;
    }

    return 80;
};

/**
 * Builds a table like output, based from the default formatter in nsp project
 * @method  output
 * @param   {Object} report - report object built in `run` function
 * @returns {String}
 */
const output = (report) => {
    if (report.error) {
        const foundIn = chalk.red(`found in ${report.projectPath}`);
        return `${chalk.red('(+) ')} ${report.error} ${foundIn}\n`;
    }

    if (!report.isVulnerable) {
        return `${chalk.green('(+)')} No known vulnerabilities found in ${report.projectPath}\n`;
    }

    const result = `${chalk.red('(+) ')} ${report.result.length} vulnerabilities found in ${report.projectPath}\n`;
    const width = getWidth();

    const row = report.result.map(function (finding) {
        var table = new Table({
            head: ['', finding.title],
            colWidths: [15, width - 15]
        });

        table.push(['Name', finding.module]);
        table.push(['Installed', finding.version]);
        table.push(['Vulnerable', finding.vulnerable_versions === '<=99.999.99999' ? 'All' : finding.vulnerable_versions]);
        table.push(['Patched', finding.patched_versions === '<0.0.0' ? 'None' : finding.patched_versions]);
        table.push(['Path', finding.path.join(' > ')]);
        table.push(['More Info', finding.advisory]);

        return table.toString() + '\n';
    });

    return `${result} \n ${row}`;
};

module.exports = function bulkRunNsp (config) {
    if (!config || !config.rootPath) {
        throw new Error('BULK-RUN-NSP: invalid parameters');
    }

    const promises = [];
    const nspBasePath = path.join(process.cwd(), 'node_modules', '.bin', 'nsp');
    const eventEmitter = new events.EventEmitter();

    const qp = queryPaths(config.rootPath, 'package.json');

    qp.on('data', (path) => {
        const promise = run(nspBasePath, path).then((report) => {
            if (config.showLog) {
                console.log(output(report));
            }

            if (report.error) {
                eventEmitter.emit('error', report.error);
                return;
            }

            eventEmitter.emit('data', report);
        });

        promises.push(promise);
    });

    qp.on('end', () => {
        Promise.all(promises).then(() => {
            eventEmitter.emit('end');
        });
    });

    return eventEmitter;
};
