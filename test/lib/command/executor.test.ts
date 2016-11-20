import {expect} from 'chai';
import {basename} from 'path';
import {remoteCommand, quickCommand} from './utils';
import {InputInterface, OutputInterface} from '../../../lib/interfaces';
import {ExecutorCommand} from '../../../lib/command/executor';
import {ArgvInput} from '../../../lib/command/io';
import {OuputExpected} from '../../../lib/command/io/output';
import {Command} from '../../../lib/command/command';
import {Param, NoParams} from '../../../lib/command/params';
import {NullFlag, BooleanFlag} from '../../../lib/command/flags';

describe('./lib/command/executor', () => {

    describe('ExecutorCommand', () => {

        let executorCommand = new ExecutorCommand;

        let exepectInstanceOutput = {
            error() { },
            log(msj) {
                expect(msj).to.be.eq('RemoteCommand OUTPUT LOG');
            }
        };

        let exepectQuickOutput = {
            error() { },
            log(msj) {
                expect(msj).to.be.eq('QuickCommand OUTPUT LOG');
            }
        };


        executorCommand.version = '0.1.0';
        executorCommand.description = 'ExecutorCommand Test';
        it('property description', () => {
            expect(executorCommand.description).to.be.eq('ExecutorCommand Test');
            expect(executorCommand.helpDescription()).to.be.eq('ExecutorCommand Test [v0.1.0]\n');
        });

        describe('method addCommand', () => {

            executorCommand.addCommand('instance', remoteCommand);
            executorCommand.addCommand('quick', quickCommand);
            executorCommand.addCommand('toInstace', './test/lib/command/utils#remoteCommand');
            executorCommand.addCommand('toQuick', './test/lib/command/utils#quickCommand');

            it('add Command Instace', () => {
                executorCommand.handle(
                    new ArgvInput(['instance']),
                    exepectInstanceOutput
                );
            });

            it('add Quick Command function', () => {
                executorCommand.handle(
                    new ArgvInput(['quick']),
                    exepectQuickOutput
                );
            });

            it('add path to Command Instace', () => {
                executorCommand.handle(
                    new ArgvInput(['toInstace']),
                    exepectInstanceOutput
                );
            });

            it('add path to Quick Command function', () => {
                executorCommand.handle(
                    new ArgvInput(['toQuick']),
                    exepectQuickOutput
                );
            });
        });

        describe('method addCommands', () => {

            executorCommand.addCommands({
                'list:instace': remoteCommand,
                'list:quick': quickCommand,
                'list:toInstace': './test/lib/command/utils#remoteCommand',
                'list:toQuick': './test/lib/command/utils#quickCommand',
            });

            it('add Command Instace', () => {
                executorCommand.handle(
                    new ArgvInput(['list:instace']),
                    exepectInstanceOutput
                );
            });

            it('add Quick Command function', () => {
                executorCommand.handle(
                    new ArgvInput(['list:quick']),
                    exepectQuickOutput
                );
            });

            it('add path to Command Instace', () => {
                executorCommand.handle(
                    new ArgvInput(['list:toInstace']),
                    exepectInstanceOutput
                );
            });

            it('add path to Quick Command function', () => {
                executorCommand.handle(
                    new ArgvInput(['list:toQuick']),
                    exepectQuickOutput
                );
            });
        });

        describe('method addCommadsNS', () => {

            executorCommand.addCommadsNS('ns', {
                'instace': remoteCommand,
                'quick': quickCommand,
                'toInstace': './test/lib/command/utils#remoteCommand',
                'toQuick': './test/lib/command/utils#quickCommand',
            });

            it('add Command Instace', () => {
                executorCommand.handle(
                    new ArgvInput(['ns:instace']),
                    exepectInstanceOutput
                );
            });

            it('add Quick Command function', () => {
                executorCommand.handle(
                    new ArgvInput(['ns:quick']),
                    exepectQuickOutput
                );
            });

            it('add path to Command Instace', () => {
                executorCommand.handle(
                    new ArgvInput(['ns:toInstace']),
                    exepectInstanceOutput
                );
            });

            it('add path to Quick Command function', () => {
                executorCommand.handle(
                    new ArgvInput(['ns:toQuick']),
                    exepectQuickOutput
                );
            });
        });

        it('help', () => {

            let node = basename(process.execPath);
            let expectOutput = () => new OuputExpected([
                (help: string, ...styles: string[]) => {

                    expect(help).to.be.eq(
                        '\n' +
                        '    ' + '%cExecutorCommand Test [v0.1.0]' +
                        '\n\n' +
                        '    ' + '%cUsage: ' + node + ' file.js [OPTIONS] [COMMAND]' +
                        '\n\n' +
                        '    ' + '%c' + '\n' +
                        '    ' + '%c[COMMAND]:' + '\n' +
                        '    ' + '%cinstance          %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%cquick             %c-' + '\n' +
                        '    ' + '%ctoInstace         %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%ctoQuick           %c-' + '\n' +
                        '    ' + '%clist:instace      %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%clist:quick        %c-' + '\n' +
                        '    ' + '%clist:toInstace    %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%clist:toQuick      %c-' + '\n' +
                        '    ' + '%cns:instace        %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%cns:quick          %c-' + '\n' +
                        '    ' + '%cns:toInstace      %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%cns:toQuick        %c-' + '\n' +
                        '    ' + '%c' + '\n' +
                        '    ' + '%c[OPTIONS]:' + '\n' +
                        '    ' + '%c-h, --help    %cPrint this help' + '\n'
                    );

                    expect(styles).to.be.deep.equal([
                        'color:green', // description
                        '', // usage
                        '', // start options
                        'color:yellow', // options title
                        'color:green', '', // instace
                        'color:green', '', // list:instace
                        'color:green', '', // list:quick
                        'color:green', '', // list:toInstace
                        'color:green', '', // list:toQuick
                        'color:green', '', // ns:instace
                        'color:green', '', // ns:quick
                        'color:green', '', // ns:toInstace
                        'color:green', '', // ns:toQuick
                        'color:green', '', // quick
                        'color:green', '', // toInstace
                        'color:green', '', // toQuick
                        '', // start options
                        'color:yellow', // options title
                        'color:green', '', // instace
                    ]);

                }
            ]);

            executorCommand.handle(
                new ArgvInput([
                    process.execPath,
                    'file.js'
                ]),
                expectOutput()
            );

            executorCommand.handle(
                new ArgvInput([
                    process.execPath,
                    'file.js',
                    '--help'
                ]),
                expectOutput()
            );

            executorCommand.handle(
                new ArgvInput([
                    process.execPath,
                    'file.js',
                    '-h'
                ]),
                expectOutput()
            );
        });

    });

});