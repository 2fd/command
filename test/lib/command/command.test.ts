import {expect} from 'chai';
import {basename} from 'path';
import {InputInterface, OutputInterface} from '../../../lib/command';
import {ArgvInput, DummyOutput} from '../../../lib/command/io';
import {Command} from '../../../lib/command/command';
import {Param, NoParams} from '../../../lib/command/params';
import {NullFlag, BoolanFlag} from '../../../lib/command/flags';

describe('./lib/command/command', () => {

    describe('Command', () => {

        it('must define flags and params property and implement action method', () => {

            // EmptyCommandImplementation ---------------------
            class EmptyCommandImplementation extends Command { }

            expect(() => {
                (new EmptyCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error, 'Command must be define params property');

            // ParamsCommandImplementation ---------------------
            class ParamsCommandImplementation extends Command {
                params = new NoParams();
            }

            expect(() => {
                (new ParamsCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error, 'Command must be define flag list property');

            // FlagssCommandImplementation --------------------
            class FlagssCommandImplementation extends Command {
                params = new NoParams();
                flags = [];
            }

            expect(() => {
                (new FlagssCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error, 'Command must be implement action method');

            // MinimunCommandImplementation --------------------
            class MinimunCommandImplementation extends Command {

                params = new NoParams();

                flags = [];

                action() { }
            }

            expect(() => {
                (new MinimunCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.not.throw(Error);
        });

        it('flags can not be repeated', () => {

            // FlagRepeatCommand --------------------
            class FlagRepeatCommand extends Command {

                params = new NoParams();

                flags = [
                    new BoolanFlag('flag1', ['-f'], 'flag1 description'),
                    new BoolanFlag('flag2', ['-f'], 'flag1 description')
                ];

                action() { }
            }

            expect(() => {
                (new FlagRepeatCommand)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error, 'Cannot overwrite flag -f in command FlagRepeatCommand');

            // FlagNameRepeatCommand --------------------
            class FlagNameRepeatCommand extends Command {

                params = new NoParams();

                flags = [
                    new BoolanFlag('FlagName', ['-a'], 'flagA description'),
                    new BoolanFlag('FlagName', ['-b'], 'flagB description')
                ];

                action() { }
            }

            expect(() => {
                (new FlagNameRepeatCommand)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error, 'Cannot overwrite flag with name FlagName in command FlagNameRepeatCommand');
        });
        
        it('action method accept input and output param', () => {

            class MinimunCommandImplementation extends Command {

                params = new NoParams();

                flags = [];

                action(input: InputInterface, output: OutputInterface) {
                    expect(input).to.be.a('object');
                    expect(input).to.be.a('object');
                }
            }

            (new MinimunCommandImplementation)
                .handle(new ArgvInput([]), new DummyOutput);
        });

        it('has a implicit help flag', () => {

            // HelpCommandImplementation --------------------
            class HelpCommandImplementation extends Command {

                params = new NoParams();

                flags = [];

                action(input: InputInterface) {
                    expect(input).to.be.deep.equal({
                        argv: [],
                        exec: [],
                        flags: {
                            'help': false
                        },
                        params: {}
                    });
                }
            }

            (new HelpCommandImplementation)
                .handle(new ArgvInput([]), new DummyOutput);

            // HelpActiveCommandImplementation --------------------
            class HelpActiveCommandImplementation extends Command {

                params = new NoParams();

                flags = [];

                action(input: InputInterface) {
                    expect(input).to.be.deep.equal({
                        argv: [],
                        exec: [],
                        flags: {
                            'help': true
                        },
                        params: {},
                    });
                }
            }

            (new HelpActiveCommandImplementation)
                .handle(new ArgvInput(['--help']), new DummyOutput);
        });

        it('help flag log command information', () => {

            let exec = basename(process.execPath);
            let simpleCommandOutput = {
                error(){},
                log( help: string ) {

                    let result = '\n' +
                            '    ' + 'Usage: ' + exec + ' file.js [OPTIONS]  ' +
                            '\n\n' +
                            '    ' + 'Simple COMMAND' +
                            '\n\n' +
                            '    ' + '--help, -h    Print this help' +
                            '\n';

                    expect(help).to.be.eq(result);
                }
            };

            class SimpleCommand extends Command {
                description = 'Simple COMMAND';
                params = new NoParams();
                flags = [];
                action() { }
            }

            (new SimpleCommand)
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '--help'
                ]), simpleCommandOutput);

            let completeCommandOutput = {
                error(){},
                log( help: string ) {

                    let result = '\n' +
                            '    ' + 'Usage: ' + exec + ' file.js [OPTIONS] require [...optionalList] ' +
                            '\n\n' +
                            '    ' + 'Complete COMMAND' +
                            '\n\n' +
                            '    ' + '-f, --flags    FLAG Description' + '\n' +
                            '    ' + '--help, -h     Print this help' + '\n';

                    expect(help).to.be.eq(result);
                }
            };

            class CompleteCommand extends Command {
                description = 'Complete COMMAND';
                params = new Param('require [...optionalList]');
                flags = [
                    new BoolanFlag('flag', ['-f', '--flags'], 'FLAG Description')
                ];
                action() { }
            }

            (new CompleteCommand)
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '--help'
                ]), completeCommandOutput);

        });
    });

});