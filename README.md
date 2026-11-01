# @2fd/command [![Build Status](https://travis-ci.org/2fd/command.svg?branch=master)](https://travis-ci.org/2fd/command)

Modular, object-oriented framework for building command line tools in Node.js,
with TypeScript definitions included.

- [Install](#install)
- [Goals](#goals)
- [Quick start](#quick-start)
- [Commands](#commands)
- [Params](#params)
- [Flags](#flags)
- [Executor (multi-command tools)](#executor-multi-command-tools)
- [Input and output](#input-and-output)
- [Error handling](#error-handling)
- [Extending](#extending)
- [API reference](#api-reference)
- [Development](#development)

## Install

```bash
npm install --save @2fd/command
```

Tested on Node.js 0.12, 4, 5, 6 and 7. No runtime dependencies.

## Goals

- **Lazy loading.** A command can be registered as a string that points to its
  module (`'./commands#migrate'`). The module is only `require`d when that
  command runs (or when help is printed), so large tools boot fast.

- **Command names belong to the tool, not to the package.** The tool that
  registers a command decides how it is invoked (`migration:init`, `mgt:i`, …).
  Third-party packages export commands; you pick the ones you need, rename
  them, or replace them with your own.

- **Fully modular.** Commands, params, flags, input and output are small
  objects behind interfaces, so any piece can be shared, replaced or extended.

- **Typed.** Type definitions ship with the package (`index.d.ts`); no
  `typings`/`@types` install required.

## Quick start

```js
// cli.js
const {
    Command,
    ExecutorCommand,
    Param,
    BooleanFlag,
    ValueFlag,
    ArgvInput,
    ConsoleOutput,
} = require('@2fd/command');

class Greet extends Command {
    constructor() {
        super();
        this.description = 'Greet someone';
        this.params = new Param('name [...others]');
        this.flags = [
            new BooleanFlag('loud', ['--loud', '-l'], 'Uppercase the greeting'),
            new ValueFlag('times', ['--times', '-t'], 'Repeat N times', Number, 1),
        ];
    }

    action(input, output) {
        const names = [input.params.name, ...(input.params.others || [])];
        let msg = 'Hello ' + names.join(', ');

        if (input.flags.loud)
            msg = msg.toUpperCase();

        for (let i = 0; i < input.flags.times; i++)
            output.log(msg);
    }
}

const tool = new ExecutorCommand();
tool.version = '1.0.0';
tool.description = 'My tool';
tool.addCommand('greet', new Greet());

tool.handle(new ArgvInput(process.argv), new ConsoleOutput());
```

```console
$ node cli.js greet Ana Bob -l -t 2
HELLO ANA, BOB
HELLO ANA, BOB
```

## Commands

A command is any object that implements `CommandInterface`:

```ts
interface CommandInterface<F, P> {
    description: string;
    handle(input: InputInterface<F, P>, output: OutputInterface): void;
}
```

You will usually extend one of the built-in classes instead of implementing it
directly.

### `Command` (class)

Extend `Command`, define `description`, `params` and `flags`, and implement
`action`. `handle()` parses the input, validates params and flags, and then
calls `action()`.

```ts
import {
    Command,
    InputInterface,
    OutputInterface,
    Param,
    BooleanFlag,
} from '@2fd/command';

type Flags = { force: boolean };
type Params = { requireParam: string; optionalParam?: string; optionalParamList?: string[] };

export class MyCommand extends Command<Flags, Params> {

    description = 'My Command description';

    params = new Param('requireParam [optionalParam] [...optionalParamList]');

    flags = [
        new BooleanFlag('force', ['--force', '-f'], 'Force flag'),
    ];

    action(input: InputInterface<Flags, Params>, output: OutputInterface): void {
        // input.params.requireParam       -> string
        // input.params.optionalParam      -> string | undefined
        // input.params.optionalParamList  -> string[] | undefined
        // input.flags.force               -> boolean
    }
}

export const myCommand = new MyCommand();
```

Rules enforced by `Command`:

- `params` is required (use `NoParams` or `IgnoreParams` for commands without
  positional arguments).
- `flags` must be an array (it can be empty).
- Two flags cannot share the same `name` or the same option (e.g. two `-f`).
- Unknown options throw `Unexpected option: <flag>`.
- A help flag (`-h, --help`) is added automatically. When present, help is
  printed and `action()` is not called.

A standalone command can run without an executor:

```js
// command.js
const { ArgvInput, ConsoleOutput } = require('@2fd/command');
const { myCommand } = require('./commands');

myCommand.handle(new ArgvInput(process.argv), new ConsoleOutput());
```

```console
$ node command.js --help

    My Command description

    Usage: node command.js [OPTIONS] requireParam [optionalParam] [...optionalParamList]


    [OPTIONS]:
    --force, -f    Force flag
    -h, --help     Print this help
```

### Quick commands (functions)

A plain function `(input, output) => void` can be registered as a command.
Set a `description` property on the function to show it in the help (defaults
to `-`). Quick commands receive the raw input: no params/flags are parsed,
`input.argv` contains the remaining arguments.

```js
function ping(input, output) {
    output.log('pong', input.argv);
}
ping.description = 'Reply with pong';

exports.ping = ping;
```

## Params

`Param` parses positional arguments from a definition string. Each
whitespace-separated token defines one param:

| Token         | Meaning                                   | Value in `input.params` |
| ------------- | ----------------------------------------- | ----------------------- |
| `name`        | required                                  | `string`                |
| `[name]`      | optional                                  | `string \| undefined`   |
| `...name`     | required list (at least one value)        | `string[]`              |
| `[...name]`   | optional list                             | `string[] \| undefined` |

```js
new Param('source');
new Param('source [target]');
new Param('...files');
new Param('src1 src2 [optional] [...rest]');
```

Values are assigned in order. A list param consumes every remaining positional
argument. Extra arguments throw `Unexpected param: <value>`; a missing required
param throws `Param <name> is required`.

Other param handlers:

| Class          | Behavior                                              |
| -------------- | ----------------------------------------------------- |
| `NoParams`     | Any positional argument throws `Unexpected param`.    |
| `IgnoreParams` | Positional arguments are silently ignored.            |

## Flags

Every flag takes `(name, list, description)`:

- `name`: key used in `input.flags`.
- `list`: options that activate the flag, e.g. `['--force', '-f']`.
- `description`: text shown in the help. Required, must not be empty.

| Class                                                | Value in `input.flags[name]`                                 |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `BooleanFlag(name, list, desc)`                      | `true` if present, otherwise `false`.                        |
| `ValueFlag(name, list, desc, parser?, default?)`     | Next argument, passed through `parser` if given. `default` if absent, otherwise `undefined`. |
| `ListValueFlag(name, list, desc, parser?, default?)` | Array of values, one per occurrence (`--tag a --tag b`). `default` (or `[]`) if absent. |
| `RequireFlag(flag)`                                  | Wraps another flag and throws if its value is `undefined`, `null`, `NaN` or empty. |
| `HelpFlag()`                                         | Boolean `help` flag on `-h, --help`. Added automatically.     |
| `NullFlag()`                                         | No-op flag.                                                  |

```js
const {
    BooleanFlag, ValueFlag, ListValueFlag, RequireFlag,
} = require('@2fd/command');

this.flags = [
    new BooleanFlag('dryRun', ['--dry-run', '-n'], 'Do not write anything'),
    new ValueFlag('port', ['--port', '-p'], 'Port to listen on', Number, 8080),
    new ListValueFlag('env', ['--env', '-e'], 'Environment variable (repeatable)'),
    new RequireFlag(
        new ValueFlag('config', ['--config', '-c'], 'Config file path')
    ),
];
```

Parsing notes:

- Any argument starting with `-` is treated as a flag.
- Values are passed as a separate argument (`--port 80`). `--port=80` and
  grouped short flags (`-abc`) are not supported.
- A value cannot start with `-`; `--port -1` throws `Flag port (--port, -p) expect a value`.

## Executor (multi-command tools)

`ExecutorCommand` routes the first positional argument to a registered command
and passes the remaining arguments to it.

```js
const { ExecutorCommand, ArgvInput, ColorConsoleOutput } = require('@2fd/command');
const { myCommand } = require('./commands');

const tool = new ExecutorCommand();
tool.version = '1.0.0';
tool.description = 'My tool';

// Command instance
tool.addCommand('run', myCommand);

// Lazy loaded: "<module path>#<export name>"
tool.addCommand('build', './lib/commands#build');

// Lazy loaded: the module itself is the command (module.exports = ...)
tool.addCommand('clean', './lib/commands/clean');

// Several at once
tool.addCommands({
    'start': './lib/commands#start',
    'stop':  './lib/commands#stop',
});

// Namespaced: registered as "db:migrate" and "db:seed"
tool.addCommadsNS('db', {
    'migrate': './lib/commands/db#migrate',
    'seed':    './lib/commands/db#seed',
});

tool.handle(new ArgvInput(process.argv), new ColorConsoleOutput());
```

Running without a command (or with an unknown one) prints the help. Commands
without a namespace are listed first, then everything is sorted alphabetically:

```console
$ node cli.js

    My tool [v1.0.0]

    Usage: node cli.js [OPTIONS] [COMMAND]


    [COMMAND]:
    build         Build the project
    clean         Remove build output
    run           My Command description
    start         Start the server
    stop          Stop the server
    db:migrate    Run migrations
    db:seed       Seed the database

    [OPTIONS]:
    -h, --help    Print this help
```

### Lazy loading paths

A string command has the format `<module>[#<export>]`:

- `<module>` starting with `.` is resolved **against `process.cwd()`**, not
  against the file that registers it. For tools that can run from any
  directory, use an absolute path:

  ```js
  const { join } = require('path');
  tool.addCommand('build', join(__dirname, 'lib/commands') + '#build');
  ```

- Any other `<module>` is resolved with `require.resolve` (package names,
  absolute paths): `'some-package/commands#migrate'`.
- Without `#<export>`, the module export itself is used.
- The export can be a command object or a quick command function.

Lazy commands are loaded when they run or when the executor help is printed
(to read their `description`).

### Executors can be nested

`ExecutorCommand` is itself a command, so it can be registered inside another
executor to build deeper command trees.

## Input and output

### `ArgvInput(argv, exec?)`

Wraps `process.argv`. It removes the Node.js executable and script path from
`argv` and stores them in `exec`, which is used to print the `Usage:` line.
If the script lives in a `PATH` directory (a globally installed `bin`), only the
script name is shown.

```ts
interface InputInterface<F, P> {
    argv: string[];   // arguments not consumed yet
    exec: string[];   // how the tool was invoked, e.g. ['node', 'cli.js']
    flags: F;         // parsed flags
    params: P;        // parsed params
}
```

### Outputs

| Class                | Behavior                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| `ConsoleOutput`      | Writes to `console.log` / `console.error`. `%c` styles are stripped.        |
| `ColorConsoleOutput` | Same, but translates `%c` CSS-like styles to ANSI colors. `error()` is red. |

Both support the `util.format` placeholders (`%s`, `%d`, `%j`) plus the browser
console placeholders `%i`, `%f`, `%o`, `%O` and `%c`:

```js
output.log('%cdone%c in %dms', 'color:green;font-weight:bold', '', 120);
output.error('Cannot open %s', file);
```

Supported `%c` styles: `color:<name>`, `background:<name>` /
`background-color:<name>`, `font-weight:bold|normal`, `font-style:italic`,
`text-decoration:underline|line-through`, `visibility:hidden`.
Color names: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`,
`white`, `gray`/`grey` (no `gray` background).

Any object with `log()` and `error()` methods can be used as output (for
example, to capture output in tests).

## Error handling

Parse and validation errors are thrown as regular `Error`s and are **not**
caught by the library. Wrap `handle()` to print a clean message and set the
exit code:

```js
try {
    tool.handle(new ArgvInput(process.argv), output);
} catch (err) {
    output.error(err.message);
    process.exitCode = 1;
}
```

Errors thrown by the library:

| Message                                     | Cause                                       |
| ------------------------------------------- | ------------------------------------------- |
| `Unexpected option: <flag>`                 | Unknown flag.                               |
| `Unexpected param: <value>`                 | Too many positional arguments.              |
| `Param <name> is required`                  | Missing required param.                     |
| `Flag <name> (<list>) expect a value`       | `ValueFlag`/`ListValueFlag` without value.  |
| `Flag <name> (<list>) is required`          | `RequireFlag` not provided.                 |
| `Cannot overwrite flag ...`                 | Duplicate flag name or option.              |
| `<export> not found in <path>`              | Lazy command export does not exist.         |

## Extending

Custom flags and params implement small interfaces with three hooks, called in
this order by `Command.handle()`:

1. `before(input, output)`: once, before parsing. Set defaults here.
2. `parse(arg, input, output)`: for each matching argument. A flag can consume
   its value with `input.argv.shift()`.
3. `after(input, output)`: once, after parsing (skipped when `--help` is
   present). Validate or normalize here.

```ts
interface FlagInterface<F> {
    name: string;
    description: string;
    list: string[];
    before(input, output): void;
    parse(flag: string, input, output): void;
    after(input, output): void;
}

interface ParamInterface<P> {
    definition: string;           // shown in the "Usage:" line
    before(input, output): void;
    parse(param: string, input, output): void;
    after(input, output): void;
}
```

Example: a counter flag (`-v -v -v` → `3`).

```js
const { FlagConstructor } = require('@2fd/command');

class CountFlag extends FlagConstructor {
    before(input) { input.flags[this.name] = 0; }
    parse(flag, input) { input.flags[this.name]++; }
    after() { }
}

new CountFlag('verbose', ['--verbose', '-v'], 'Increase verbosity');
```

To customize the help, override `helpDescription()`, `helpUsage(executable)` or
`helpOptions()` in your command, or replace the help flag by setting
`helpFlag` before the first `handle()` call.

## API reference

Everything below is exported from `@2fd/command`.

| Export               | Kind      | Description                                       |
| -------------------- | --------- | ------------------------------------------------- |
| `Command`            | class     | Base class for commands with params and flags.    |
| `ExecutorCommand`    | class     | Routes sub-commands; supports lazy loading.       |
| `Param`              | class     | Positional params from a definition string.       |
| `NoParams`           | class     | Rejects positional params.                        |
| `IgnoreParams`       | class     | Ignores positional params.                        |
| `FlagConstructor`    | class     | Base class that validates `name`, `list`, `description`. |
| `BooleanFlag`        | class     | `true`/`false` flag.                              |
| `ValueFlag`          | class     | Flag with a single value.                         |
| `ListValueFlag`      | class     | Repeatable flag with a list of values.            |
| `RequireFlag`        | class     | Makes a wrapped flag required.                    |
| `HelpFlag`           | class     | `-h, --help`.                                     |
| `NullFlag`           | class     | No-op flag.                                       |
| `ArgvInput`          | class     | Input from `process.argv`.                        |
| `ConsoleOutput`      | class     | Plain console output.                             |
| `ColorConsoleOutput` | class     | Console output with ANSI colors.                  |
| `CommandInterface`   | interface | Contract for any command.                         |
| `InputInterface`     | interface | Contract for input objects.                       |
| `OutputInterface`    | interface | Contract for output objects.                      |

## Development

```bash
npm install
npm run compile       # tsc -p .
npm run declaration   # generate .d.ts files
npm test              # mocha (run compile first)
```

## License

[MIT](LICENSE)
