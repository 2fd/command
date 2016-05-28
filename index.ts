import {
    CommandInterface,
    InputInterface,
    OutputInterface
} from './lib/interfaces';

import {Command} from './lib/command/command';

import {ExecutorCommand} from './lib/command/executor';

import {
    ArgvInput,
    ConsoleOutput,
    ColorConsoleOutput
} from './lib/command/io';

import {
    IgnoreParams,
    NoParams,
    Param
} from './lib/command/params';

import {
    FlagConstructor,
    BooleanFlag,
    HelpFlag,
    NullFlag
} from './lib/command/flags';

export {
    
    // interfaces
    CommandInterface,
    InputInterface,
    OutputInterface,
    
    // commands
    Command,
    ExecutorCommand,
    
    // input
    ArgvInput,
    
    // output
    ConsoleOutput,
    ColorConsoleOutput,
    
    // params
    IgnoreParams,
    NoParams,
    Param,
    
    // flags
    FlagConstructor,
    BooleanFlag,
    HelpFlag,
    NullFlag,
};
