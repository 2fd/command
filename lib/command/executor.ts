import {
    CommandInterface,
    CommnadList,
    CommandType,
    CommandTypeList,
    InputInterface,
    OutputInterface,
    QuickCommandType,
    FlagInterface,
    ParamInterface,
} from '../command';

import {
    QuickCommandProxy,
    StringCommandProxy
} from './proxy';

import {toString, repeat, TAB_SIZE} from './helper';

export class ExecutorCommand implements CommandInterface {

    _commands: CommnadList = {};

    _description: string = '';

    get description(): string {
        return `${this._description} [v${this.version}]`;
    }

    set description(desc: string) {
        this._description = desc;
    }

    version: string = '0.0.0';

    addCommand(name: string, exec: CommandType): this {

        switch (typeof exec) {
            case 'string':
                this._commands[name] = new StringCommandProxy(<string>exec);
                break;
            case 'function':
                this._commands[name] = new QuickCommandProxy(<QuickCommandType>exec);
                break;
            default:
                if (Object(exec) === exec) {
                    this._commands[name] = <CommandInterface>exec;
                } else {
                    throw new TypeError(`Unexpected type ${toString(exec)} in command ${name}`);
                }
        };

        return this;
    }

    addCommands(commandList: CommandTypeList): this {

        Object
            .keys(commandList)
            .forEach(name => this.addCommand(name, commandList[name]));

        return this;
    }

    addCommadsNS(ns: string, commandList: CommandTypeList): this {

        Object
            .keys(commandList)
            .forEach(name => this.addCommand(ns + ':' + name, commandList[name]));

        return this;
    }

    handle(input: InputInterface, output: OutputInterface): void {

        let command = input.argv.shift();

        if (
            typeof command === 'undefined' ||
            !this._commands[command]
        ) {
            this.help(input, output);

        } else {
            this._commands[command].handle(input, output);
        }
    }

    help(input: InputInterface, output: OutputInterface) {

        let ident = repeat(' ', TAB_SIZE);

        output.log([
            '',
            ident + this.description,
            '',
            ident + 'Usage: ' + input.exec.join(' ') + ' [COMMAND]',
            '',
            this.helpCommandList()
        ].join('\n') + '\n');
    }

    helpCommandList(): string {

        let commands = Object.keys(this._commands);
        let commandLengths = commands.map(command => command.length);
        let max = Math.max(...commandLengths);
        let ident = repeat(' ', TAB_SIZE);

        let commandDescriptions = commands.sort().map(command => {
            let space = repeat(' ', max - command.length + TAB_SIZE);
            return ident + command + space + this._commands[command].description;
        });

        return commandDescriptions.join('\n');
    }
}