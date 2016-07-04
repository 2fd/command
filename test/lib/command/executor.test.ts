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
            expect(exec.description).to.be.eq('ExecutorCommand Test')
            expect(exec.helpDescription()).to.be.eq('ExecutorCommand Test [v0.1.0]\n')
        });

        describe('method addCommand', () => {

            exec.addCommand('instance', remoteCommand);
            exec.addCommand('quick', quickCommand);
            exec.addCommand('toInstace', './test/lib/command/utils#remoteCommand');
            exec.addCommand('toQuick', './test/lib/command/utils#quickCommand');

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
                'list:toInstace': './test/lib/command/utils#remoteCommand',
                'list:toQuick': './test/lib/command/utils#quickCommand',
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
                'toInstace': './test/lib/command/utils#remoteCommand',
                'toQuick': './test/lib/command/utils#quickCommand',
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
            
            let node = basename(process.execPath);
            let expectOutput = new OuputExpected([
                (help: string, ...styles:string[]) => {
                    
                    expect(help).to.be.eq(
                        '\n' +
                        '    ' + '%cExecutorCommand Test [v0.1.0]' +
                        '\n\n' +
                        '    ' + '%cUsage: ' + node + ' file.js [OPTIONS] [COMMAND]' +
                        '\n\n' +
                        '    ' + '%c'         + '\n' +
                        '    ' + '%c[COMMAND]:' + '\n' +
                        '    ' + '%cinstance          %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%clist:instace      %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%clist:quick        %c-'                      + '\n' +
                        '    ' + '%clist:toInstace    %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%clist:toQuick      %c-'                      + '\n' +
                        '    ' + '%cns:instace        %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%cns:quick          %c-'                      + '\n' +
                        '    ' + '%cns:toInstace      %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%cns:toQuick        %c-'                      + '\n' +
                        '    ' + '%cquick             %c-'                      + '\n' +
                        '    ' + '%ctoInstace         %cCommand: RemoteCommand' + '\n' +
                        '    ' + '%ctoQuick           %c-'                      + '\n' +
                        '    ' + '%c'         + '\n' +
                        '    ' + '%cOPTIONS:' + '\n' +
                        '    ' + '%c--help, -h    %cPrint this help' + '\n'
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

            exec.handle(
                new ArgvInput([
                    process.execPath,
                    'file.js'
                ]),
                expectOutput
            );
        });

    });

});