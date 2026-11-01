import {describe, it, assert} from '../../harness';
import {plain} from './utils';
import {basename} from 'path';
import {InputInterface, OutputInterface} from '../../../lib/interfaces';
import {ArgvInput, DummyOutput} from '../../../lib/command/io';
import {OuputExpected} from '../../../lib/command/io/output';
import {Command} from '../../../lib/command/command';
import {Param, NoParams} from '../../../lib/command/params';
import {NullFlag, BooleanFlag} from '../../../lib/command/flags';

describe('./lib/command/command', () => {

    describe('Command', () => {

        it('must define flags and params property and implement action method', () => {

            // EmptyCommandImplementation ---------------------
            class EmptyCommandImplementation extends Command<any, any> { }

            assert.throws(() => {
                (new EmptyCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }, { message: 'Command must be define params property' });

            // ParamsCommandImplementation ---------------------
            class ParamsCommandImplementation extends Command<any, any> {
                params = new NoParams();
            }

            assert.throws(() => {
                (new ParamsCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }, { message: 'Command must be define flag list property' });

            // FlagssCommandImplementation --------------------
            class FlagssCommandImplementation extends Command<any, any> {
                params = new NoParams();
                flags = [];
            }

            assert.throws(() => {
                (new FlagssCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            }, { message: 'Command must be implement action method' });

            // MinimunCommandImplementation --------------------
            class MinimunCommandImplementation extends Command<any, any> {

                params = new NoParams();

                flags = [];

                action() { }
            }

            assert.doesNotThrow(() => {
                (new MinimunCommandImplementation)
                    .handle(new ArgvInput([]), new DummyOutput);
            });
        });

        it('flags can not be repeated', () => {

            // FlagRepeatCommand --------------------
            class FlagRepeatCommand extends Command<any, any> {

                params = new NoParams();

                flags = [
                    new BooleanFlag('flag1', ['-f'], 'flag1 description'),
                    new BooleanFlag('flag2', ['-f'], 'flag1 description')
                ];

                action() { }
            }

            assert.throws(() => {
                (new FlagRepeatCommand)
                    .handle(new ArgvInput([]), new DummyOutput);
            }, { message: 'Cannot overwrite flag -f in command FlagRepeatCommand' });

            // FlagNameRepeatCommand --------------------
            class FlagNameRepeatCommand extends Command<any, any> {

                params = new NoParams();

                flags = [
                    new BooleanFlag('FlagName', ['-a'], 'flagA description'),
                    new BooleanFlag('FlagName', ['-b'], 'flagB description')
                ];

                action() { }
            }

            assert.throws(() => {
                (new FlagNameRepeatCommand)
                    .handle(new ArgvInput([]), new DummyOutput);
            }, { message: 'Cannot overwrite flag with name FlagName in command FlagNameRepeatCommand' });
        });

        it('action method accept input and output param', () => {

            class MinimunCommandImplementation extends Command<{}, {}> {

                params = new NoParams();

                flags = [];

                action(input: InputInterface<{}, {}>, output: OutputInterface) {
                    assert.strictEqual(typeof input, 'object');
                    assert.strictEqual(typeof input, 'object');
                }
            }

            (new MinimunCommandImplementation)
                .handle(new ArgvInput([]), new DummyOutput);
        });

        it('has a implicit help flag', () => {

            // HelpCommandImplementation --------------------
            class HelpCommandImplementation extends Command<{}, { help?: boolean }> {

                params = new NoParams();

                flags = [];

                action(input: InputInterface<{}, { help?: boolean }>) {
                    assert.deepStrictEqual(plain(input), {
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
            class HelpActiveCommandImplementation extends Command<{}, { help?: boolean }> {

                params = new NoParams();

                flags = [];

                action(input: InputInterface<{}, { help?: boolean }>) {
                    assert.deepStrictEqual(plain(input), {
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

            class SimpleCommand extends Command<{}, { help?: boolean }> {
                description = 'Simple COMMAND';
                params = new NoParams();
                flags = [];
                action() { }
            }

            let simpleCommand = new SimpleCommand;
            let expectSimpleOutput = () => new OuputExpected([

                (help: string, ...styles: string[]) => {
                    assert.strictEqual(help, 
                        '\n' +
                        '    ' + '%cSimple COMMAND' +
                        '\n\n' +
                        '    ' + '%cUsage: ' + exec + ' file.js [OPTIONS] ' +
                        '\n\n' +
                        '    ' + '%c' + '\n' +
                        '    ' + '%c[OPTIONS]:' + '\n' +
                        '    ' + '%c-h, --help    %cPrint this help' +
                        '\n'
                    );

                    assert.deepStrictEqual(styles, [
                        'color:green', // description
                        '', // usage
                        '', // start options
                        'color:yellow', // options title
                        'color:green', '', // help flag
                    ]);
                },

            ]);

            simpleCommand
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js'
                ]), expectSimpleOutput());

            simpleCommand
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '-h'
                ]), expectSimpleOutput());

            simpleCommand
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '--help'
                ]), expectSimpleOutput());

            class CompleteCommand extends Command<{}, {}> {
                description = 'Complete COMMAND';
                params = new Param('require [...optionalList]');
                flags = [
                    new BooleanFlag('flag', ['-f', '--flags'], 'FLAG Description')
                ];
                action() { }
            }

            let completeCommand = new CompleteCommand;
            let expectCompleteOutput = () => new OuputExpected([

                (help: string, ...styles: string[]) => {
                    assert.strictEqual(help, 
                        '\n' +
                        '    ' + '%cComplete COMMAND' +
                        '\n\n' +
                        '    ' + '%cUsage: ' + exec + ' file.js [OPTIONS] require [...optionalList]' +
                        '\n\n' +
                        '    ' + '%c' + '\n' +
                        '    ' + '%c[OPTIONS]:' + '\n' +
                        '    ' + '%c-f, --flags    %cFLAG Description' + '\n' +
                        '    ' + '%c-h, --help     %cPrint this help' + '\n'
                    );

                    assert.deepStrictEqual(styles, [
                        'color:green', // description
                        '', // usage
                        '', // start options
                        'color:yellow', // options title
                        'color:green', '', // f flag
                        'color:green', '', // help flag
                    ]);

                },

            ]);

            completeCommand
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '-h'
                ]), expectCompleteOutput());

            completeCommand
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '--help'
                ]), expectCompleteOutput());

        });
    });

});