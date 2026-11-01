/**
 * Consumer fixture: type-checks the published declarations of `@2fd/command`
 * against several TypeScript versions (see .github/workflows/test.yml).
 * It is only compiled, never executed.
 */

import {
    CommandInterface,
    InputInterface,
    OutputInterface,
    Command,
    ExecutorCommand,
    ArgvInput,
    ConsoleOutput,
    ColorConsoleOutput,
    IgnoreParams,
    NoParams,
    Param,
    FlagConstructor,
    BooleanFlag,
    HelpFlag,
    NullFlag,
    ValueFlag,
    ListValueFlag,
    RequireFlag,
} from '@2fd/command';

interface HelloFlags {
    verbose: boolean;
    name: string;
    tags: Array<string>;
}

interface HelloParams {
    file: string;
}

class HelloCommand extends Command<HelloFlags, HelloParams> {

    description = 'Say hello';

    flags = [
        new BooleanFlag<HelloFlags>('verbose', ['-v', '--verbose'], 'Verbose output'),
        new RequireFlag<HelloFlags>(new ValueFlag<string>('name', ['--name'], 'Name', String, 'world')),
        new ListValueFlag<string>('tags', ['--tag'], 'Tags', String, []),
    ];

    params = new Param<HelloParams>('file');

    action(input: InputInterface<HelloFlags, HelloParams>, output: OutputInterface): void {
        output.log('hello %s from %s', input.flags.name, input.params.file);
    }
}

class EmptyCommand extends Command<{}, {}> {

    description = 'No flags, no params';

    flags = [new NullFlag()];

    params = new NoParams();

    action(input: InputInterface<{}, {}>, output: OutputInterface): void {
        output.error('nothing to do');
    }
}

class IgnoreCommand extends Command<{}, {}> {

    description = 'Ignores params';

    flags = [new HelpFlag()];

    params = new IgnoreParams();

    action(input: InputInterface<{}, {}>, output: OutputInterface): void {}
}

class CustomCommand implements CommandInterface<{}, {}> {

    description = 'Implements the interface directly';

    handle(input: InputInterface<{}, {}>, output: OutputInterface): void {
        output.log(input.argv.join(' '));
    }
}

const custom: FlagConstructor = new FlagConstructor('custom', ['--custom'], 'Custom flag');

const executor: ExecutorCommand = new ExecutorCommand()
    .addCommand('hello', new HelloCommand())
    .addCommand('quick', (input: InputInterface<any, any>, output: OutputInterface) => output.log('quick'))
    .addCommand('path', './commands/path')
    .addCommands({
        empty: new EmptyCommand(),
        ignore: new IgnoreCommand(),
        custom: new CustomCommand(),
    });

const output: OutputInterface = custom.name ? new ColorConsoleOutput() : new ConsoleOutput();

executor.handle(new ArgvInput(['node', 'cli', 'hello', 'file.txt']), output);
