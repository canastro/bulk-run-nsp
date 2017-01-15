const sinon = require('sinon');
const expect = require('chai').expect;
const requireUncached = require('require-uncached');
const mock = require('mock-require');

describe('index', function() {
    var sandbox;

    beforeEach(function() {
        // Create a sandbox for the test
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        // Restore all the things made through the sandbox
        sandbox.restore();
    });

    context('when no config is provided', () => {
        it('should throw error', () => {
            const bulkRunNsp = requireUncached('../src/index');

            expect(() => bulkRunNsp()).to.throw(/BULK-RUN-NSP: invalid parameters/);
        });
    });

    context('when no rootPath is provided', () => {
        it('should throw error', () => {
            const bulkRunNsp = requireUncached('../src/index');

            expect(() => bulkRunNsp({})).to.throw(/BULK-RUN-NSP: invalid parameters/);
        });
    });

    context.skip('when a path and showLog are provided', () => {
        context('when the project is not vulnerable', () => {
            it('should return json and show log', (done) => {
                const exec = (command, args, cb) => { cb(null); };
                sandbox.spy(console, 'log');

                mock('child_process', { exec });

                mock('query-paths', () => Promise.resolve(['/dummy/folderA']));

                const bulkRunNsp = requireUncached('../src/index');

                bulkRunNsp({ rootPath: '/dummy', showLog: true }).then((output) => {
                    expect(output).to.deep.equal([ { projectPath: '/dummy/folderA', isVulnerable: false } ]);
                    expect(console.log.called).to.equal(true);
                    done();
                });
            });
        });

        context('when project is vulnerable', () => {
            it('should return json', (done) => {
                sandbox.stub(process.stdout, 'getWindowSize').returns([100, 100]);
                const errorReport = [{
                    'id':118,
                    'updated_at': '2016-08-09T14:16:01.000Z',
                    'created_at': '2016-05-25T16:37:20.000Z',
                    'publish_date': '2016-06-20T15:52:52.000Z',
                    'overview': 'OVERVIEW-TEST',
                    'recommendation': 'Updated to version 3.0.2 or greater',
                    'cvss_vector': 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
                    'cvss_score': 7.5,
                    'module': 'minimatch',
                    'version': '2.0.10',
                    'vulnerable_versions': '<=3.0.1',
                    'patched_versions': '>=3.0.2',
                    'title': 'Regular Expression Denial of Service',
                    'path': ['test-project@0.0.1','angular2@2.0.0-alpha.37','traceur@0.0.87','glob@4.3.5','minimatch@2.0.10'],
                    'advisory': 'https://nodesecurity.io/advisories/118'
                }];

                const exec = (command, args, cb) => {
                    cb('ERROR', null, JSON.stringify(errorReport));
                };

                sandbox.spy(console, 'log');

                mock('child_process', { exec });

                mock('query-paths', () => Promise.resolve(['/dummy/folderA']));

                const bulkRunNsp = requireUncached('../src/index');

                bulkRunNsp({ rootPath: '/dummy', showLog: true }).then((output) => {
                    expect(output).to.deep.equal([{
                        projectPath: '/dummy/folderA',
                        isVulnerable: true,
                        result: errorReport
                    }]);

                    expect(console.log.calledOnce).to.equal(true);
                    done();
                });
            });
        });
    });

    context.skip('when a showLog is false', () => {
        context('when the project is not vulnerable', () => {
            it('should return json', (done) => {
                const exec = (command, args, cb) => { cb(null); };
                sandbox.spy(console, 'log');

                mock('child_process', { exec });

                mock('query-paths', () => Promise.resolve(['/dummy/folderA']));

                const bulkRunNsp = requireUncached('../src/index');

                bulkRunNsp({ rootPath: '/dummy' }).then((output) => {
                    expect(output).to.deep.equal([ { projectPath: '/dummy/folderA', isVulnerable: false } ]);
                    expect(console.log.called).to.equal(false);
                    done();
                });
            });
        });
    });

    describe.skip('isTTY', () => {
        const errorReport = [{
            'id':118,
            'updated_at': '2016-08-09T14:16:01.000Z',
            'created_at': '2016-05-25T16:37:20.000Z',
            'publish_date': '2016-06-20T15:52:52.000Z',
            'overview': 'OVERVIEW-TEST',
            'recommendation': 'Updated to version 3.0.2 or greater',
            'cvss_vector': 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
            'cvss_score': 7.5,
            'module': 'minimatch',
            'version': '2.0.10',
            'vulnerable_versions': '<=3.0.1',
            'patched_versions': '>=3.0.2',
            'title': 'Regular Expression Denial of Service',
            'path': ['test-project@0.0.1','angular2@2.0.0-alpha.37','traceur@0.0.87','glob@4.3.5','minimatch@2.0.10'],
            'advisory': 'https://nodesecurity.io/advisories/118'
        }];
        var original;

        beforeEach(() => {
            original = Object.assign({}, process.stdout);
        });

        afterEach(() => {
            process.stdout = original;
        });

        context('when isTTY is false', () => {
            it('should still successfuly call console.log', (done) => {
                process.stdout.isTTY = false;

                const exec = (command, args, cb) => {
                    cb('ERROR', null, JSON.stringify(errorReport));
                };

                sandbox.spy(console, 'log');

                mock('child_process', { exec });

                mock('query-paths', () => Promise.resolve(['/dummy/folderA']));

                const bulkRunNsp = requireUncached('../src/index');

                bulkRunNsp({ rootPath: '/dummy', showLog: true }).then((output) => {
                    expect(output).to.deep.equal([{
                        projectPath: '/dummy/folderA',
                        isVulnerable: true,
                        result: errorReport
                    }]);

                    expect(console.log.calledOnce).to.equal(true);
                    done();
                });
            });
        });

        context('when isTTY is true', () => {
            it('should still successfuly call console.log', (done) => {
                process.stdout.isTTY = true;
                sandbox.stub(process.stdout, 'getWindowSize').returns([100, 100]);

                const exec = (command, args, cb) => {
                    cb('ERROR', null, JSON.stringify(errorReport));
                };

                sandbox.spy(console, 'log');

                mock('child_process', { exec });

                mock('query-paths', () => Promise.resolve(['/dummy/folderA']));

                const bulkRunNsp = requireUncached('../src/index');

                bulkRunNsp({ rootPath: '/dummy', showLog: true }).then((output) => {
                    expect(output).to.deep.equal([{
                        projectPath: '/dummy/folderA',
                        isVulnerable: true,
                        result: errorReport
                    }]);

                    expect(console.log.calledOnce).to.equal(true);
                    done();
                });
            });
        });
    });
});
