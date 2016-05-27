import {Command} from './lib/command/command';
import {ExecutorCommand} from './lib/command/executor';
import {FlagConstructor, BoolanFlag, HelpFlag, NullFlag} from './lib/command/flags';
import {ArgvInput, ConsoleOutput, ColorConsoleOutput, DummyOutput} from './lib/command/io';
import {IgnoreParams, NoParams, Param} from './lib/command/params';
import {QuickCommandProxy, StringCommandProxy} from './lib/command/proxy';

export {
    Command,
    ExecutorCommand,
    
    FlagConstructor,
    BoolanFlag,
    HelpFlag,
    NullFlag,
    
    ArgvInput,
    ConsoleOutput,
    ColorConsoleOutput,
    DummyOutput,
    
    IgnoreParams,
    NoParams,
    Param,
    
    QuickCommandProxy,
    StringCommandProxy
};