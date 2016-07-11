import {
    CommandInterface,
    CommandType,
    InputInterface,
    OutputInterface,
    QuickCommandType,
    FlagInterface,
    ParamInterface,
} from '../interfaces';

import {
    QuickCommandProxy,
    StringCommandProxy
} from './proxy';

import {Param} from './params';
import {SoftCommand} from './command';
import {toString, commandSort, repeat, TAB_SIZE} from './utils';

export type ExecutorParams = {
    COMMAND?: string;
}

export type ExecutorFlags = {
    help?: boolean;
}

export type CommandListIndex = {
    [command: string]: CommandInterface<any, any>;
}

export type CommandTypeListIndex = {
    [command: string]: CommandType;
}

export class ExecutorCommand extends SoftCommand<ExecutorParams, ExecutorFlags> {

    _commands: CommandListIndex = {};

    _hasToConsume: boolean = true;

    version: string = '0.0.0';

    description: string = '';

    flags = [];

    params = new Param('[COMMAND]');

    addCommand(name: string, exec: CommandType): this {

        let command: CommandInterface<any, any>;
        let typeOf = typeof exec;

        if (typeOf === 'string') {
            command = new StringCommandProxy(exec as string);

        } else if (typeOf === 'function') {
            command = new QuickCommandProxy(exec as QuickCommandType);

        } else if (typeOf === 'object' && exec !== null && !Array.isArray(exec)) {
            command = exec as CommandInterface<any, any>;

        } else {
            throw new TypeError(`Unexpected type ${toString(exec)} in command ${name}`);
        }

        this._commands[name] = command;

        return this;
    }

    addCommands(commandList: CommandTypeListIndex): this {

        Object
            .keys(commandList)
            .forEach(name => this.addCommand(name, commandList[name]));

        return this;
    }

    addCommadsNS(ns: string, commandList: CommandTypeListIndex): this {

        Object
            .keys(commandList)
            .forEach(name => this.addCommand(ns + ':' + name, commandList[name]));

        return this;
    }

    action(input: InputInterface<ExecutorFlags, ExecutorParams>, output: OutputInterface): void {

        let params = input.params;

        if (this._commands[params.COMMAND]) {
            let Input: any = input.constructor;
            let subInput: InputInterface<any, any> = new Input(input.argv, input.exec);
            this._commands[params.COMMAND].handle(subInput, output);

        } else {
            this.help(input, output);
        }
    }

    hasToConsume(input: InputInterface<ExecutorFlags, ExecutorParams>, output: OutputInterface): boolean {
        return !input.params.COMMAND && super.hasToConsume(input, output);
    }

    /**
     * Return command description
     */
    helpDescription(): string {
        return this.description + ' [v' + this.version + ']\n';
    }

    /**
     * 
     */
    helpOptions(): Array<string[]> {

        let commands = Object.keys(this._commands);
        let max = Math.max(
            ...commands.map(command => command.length)
        );

        let helpCommands = commands
            .sort(commandSort)
            .map(command => {

                let space = repeat(' ', max - command.length + TAB_SIZE);

                return [command + space, this._commands[command].description];
            });

        return [
            [this.params.definition + ':'],
            ...helpCommands,
            ...super.helpOptions(),
        ];
    }
}