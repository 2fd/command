import {expect} from 'chai';
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
                    new BooleanFlag('flag1', ['-f'], 'flag1 description'),
                    new BooleanFlag('flag2', ['-f'], 'flag1 description')
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
                    new BooleanFlag('FlagName', ['-a'], 'flagA description'),
                    new BooleanFlag('FlagName', ['-b'], 'flagB description')
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

            class SimpleCommand extends Command {
                description = 'Simple COMMAND';
                params = new NoParams();
                flags = [];
                action() { }
            }
            
            let expectSimpleOutput = new OuputExpected([
                
                (help: string, ...styles: string[]) => {
                    expect(help).to.be.eq(
                        '\n' +
                        '    ' + '%cSimple COMMAND' +
                        '\n\n' +
                        '    ' + '%cUsage: ' + exec + ' file.js [OPTIONS]  ' +
                        '\n\n' +
                        '    ' + '%c--help, -h    %cPrint this help' +
                        '\n'
                    )
                    
                    expect(styles).to.be.deep.equal([
                        'color:green', // description
                        '', // usage
                        'color:green', '' // help flag
                    ]);
                },
                
            ]);

            (new SimpleCommand)
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '--help'
                ]), expectSimpleOutput);

            class CompleteCommand extends Command {
                description = 'Complete COMMAND';
                params = new Param('require [...optionalList]');
                flags = [
                    new BooleanFlag('flag', ['-f', '--flags'], 'FLAG Description')
                ];
                action() { }
            }
                
            let expectCompleteOutput = new OuputExpected([
                
                (help: string, ...styles: string[]) => {
                    expect(help).to.be.eq(
                        '\n' +
                        '    ' + '%cComplete COMMAND' +
                        '\n\n' +
                        '    ' + '%cUsage: ' + exec + ' file.js [OPTIONS] require [...optionalList] ' +
                        '\n\n' +
                        '    ' + '%c-f, --flags    %cFLAG Description' + '\n' +
                        '    ' + '%c--help, -h     %cPrint this help' + '\n'
                    )
                    
                    expect(styles).to.be.deep.equal([
                        'color:green', // description
                        '', // usage
                        'color:green', '', // f flag
                        'color:green', '', // help flag
                    ])
                    
                },
                
            ]);

            (new CompleteCommand)
                .handle(new ArgvInput([
                    process.execPath,
                    'file.js',
                    '--help'
                ]), expectCompleteOutput);

        });
    });

});