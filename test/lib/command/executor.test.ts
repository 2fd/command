import {expect} from 'chai';
import {basename} from 'path';
import {remoteCommand, quickCommand} from './mocks';
import {InputInterface, OutputInterface} from '../../../lib/interfaces';
import {ExecutorCommand} from '../../../lib/command/executor';
import {ArgvInput} from '../../../lib/command/io';
import {Command} from '../../../lib/command/command';
import {Param, NoParams} from '../../../lib/command/params';
import {NullFlag, BooleanFlag} from '../../../lib/command/flags';

describe('./lib/command/executor', () => {

    describe('ExecutorCommand', () => {

        let exec = new ExecutorCommand;

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


        exec.version = '0.1.0';
        exec.description = 'ExecutorCommand Test';
        it('property description', () => {
            expect(exec.description).to.be.eq('ExecutorCommand Test [v0.1.0]')
        });

        describe('method addCommand', () => {

            exec.addCommand('instance', remoteCommand);
            exec.addCommand('quick', quickCommand);
            exec.addCommand('toInstace', './test/lib/command/mocks#remoteCommand');
            exec.addCommand('toQuick', './test/lib/command/mocks#quickCommand');

            it('add Command Instace', () => {
                exec.handle(
                    new ArgvInput(['instance']),
                    exepectInstanceOutput
                );
            });

            it('add Quick Command function', () => {
                exec.handle(
                    new ArgvInput(['quick']),
                    exepectQuickOutput
                );
            });

            it('add path to Command Instace', () => {
                exec.handle(
                    new ArgvInput(['toInstace']),
                    exepectInstanceOutput
                );
            });

            it('add path to Quick Command function', () => {
                exec.handle(
                    new ArgvInput(['toQuick']),
                    exepectQuickOutput
                );
            });
        });

        describe('method addCommands', () => {

            exec.addCommands({
                'list:instace': remoteCommand,
                'list:quick': quickCommand,
                'list:toInstace': './test/lib/command/mocks#remoteCommand',
                'list:toQuick': './test/lib/command/mocks#quickCommand',
            });

            it('add Command Instace', () => {
                exec.handle(
                    new ArgvInput(['list:instace']),
                    exepectInstanceOutput
                );
            });

            it('add Quick Command function', () => {
                exec.handle(
                    new ArgvInput(['list:quick']),
                    exepectQuickOutput
                );
            });

            it('add path to Command Instace', () => {
                exec.handle(
                    new ArgvInput(['list:toInstace']),
                    exepectInstanceOutput
                );
            });

            it('add path to Quick Command function', () => {
                exec.handle(
                    new ArgvInput(['list:toQuick']),
                    exepectQuickOutput
                );
            });
        });

        describe('method addCommadsNS', () => {

            exec.addCommadsNS('ns', {
                'instace': remoteCommand,
                'quick': quickCommand,
                'toInstace': './test/lib/command/mocks#remoteCommand',
                'toQuick': './test/lib/command/mocks#quickCommand',
            });

            it('add Command Instace', () => {
                exec.handle(
                    new ArgvInput(['ns:instace']),
                    exepectInstanceOutput
                );
            });

            it('add Quick Command function', () => {
                exec.handle(
                    new ArgvInput(['ns:quick']),
                    exepectQuickOutput
                );
            });

            it('add path to Command Instace', () => {
                exec.handle(
                    new ArgvInput(['ns:toInstace']),
                    exepectInstanceOutput
                );
            });

            it('add path to Quick Command function', () => {
                exec.handle(
                    new ArgvInput(['ns:toQuick']),
                    exepectQuickOutput
                );
            });
        });

        it('help', () => {
            let helpOutput = {
                error() { },
                log(msj) {

                    let node = basename(process.execPath);
                    let result = '\n' +
                        '    ' + 'ExecutorCommand Test [v0.1.0]' +
                        '\n\n' +
                        '    ' + 'Usage: ' + node + ' file.js [COMMAND]' +
                        '\n\n' +
                        '    ' + 'instance          Command: RemoteCommand' + '\n' +
                        '    ' + 'list:instace      Command: RemoteCommand' + '\n' +
                        '    ' + 'list:quick        Command: quickCommand' + '\n' +
                        '    ' + 'list:toInstace    Command: RemoteCommand' + '\n' +
                        '    ' + 'list:toQuick      Command: quickCommand' + '\n' +
                        '    ' + 'ns:instace        Command: RemoteCommand' + '\n' +
                        '    ' + 'ns:quick          Command: quickCommand' + '\n' +
                        '    ' + 'ns:toInstace      Command: RemoteCommand' + '\n' +
                        '    ' + 'ns:toQuick        Command: quickCommand' + '\n' +
                        '    ' + 'quick             Command: quickCommand' + '\n' +
                        '    ' + 'toInstace         Command: RemoteCommand' + '\n' +
                        '    ' + 'toQuick           Command: quickCommand' + '\n';

                    expect(msj).to.be.eq(result);
                }
            };

            exec.handle(
                new ArgvInput([
                    process.execPath,
                    'file.js'
                ]),
                helpOutput
            );
        });

    });

});