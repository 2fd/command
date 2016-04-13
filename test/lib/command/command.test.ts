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
            }).to.throw(Error);

            // ParamsCommandImplementation ---------------------
            class ParamsCommandImplementation extends Command {
                params = new NoParams();
            }

            expect(() => {
                (new ParamsCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error);

            // FlagssCommandImplementation --------------------
            class FlagssCommandImplementation extends Command {
                flags = [];
            }

            expect(() => {
                (new FlagssCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error);

            // ActionCommandImplementation --------------------
            class ActionCommandImplementation extends Command {
                action() { }
            }

            expect(() => {
                (new ActionCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }).to.throw(Error);

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