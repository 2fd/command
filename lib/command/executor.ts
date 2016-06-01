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
} from '../interfaces';

import {
    QuickCommandProxy,
    StringCommandProxy
} from './proxy';

import {toString, repeat, TAB_SIZE} from './helper';

export class ExecutorCommand implements CommandInterface {

    _commands: CommnadList = {};

    description: string = '';

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
            
            try {
                this._commands[command].handle(input, output);
            } catch (e) {
                let err: Error = <Error>e;
                output.error('%c' + err.message, 'background:red;color:white');
                output.error(err.stack);
            }
        }
    }

    /**
     * Print help info from command
     */
    help(input: InputInterface, output: OutputInterface): void {

        let ident = repeat(' ', TAB_SIZE);
        let join = '\n' + ident;
        let executable = input.exec.join(' ');
        let helps: Array<string> = [];
        let styles: Array<string> = [];

        helps.push('');
        helps.push('%c' + this.helpDescription());
        styles.push('color:green');
        
        helps.push('%c' + this.helpUsage(executable));
        styles.push(''); // reset styles
        
        this.helpOptions()
            .forEach((definition) => {
                let [option, description] = definition;
                let hasOption = !!option;
                let hasDescription = !!description;
                
                if(!hasOption) {
                    helps.push('%c');
                    styles.push(''); // reset styles
                
                } else if (!hasDescription) {
                    helps.push('%c' + option + ':');
                    styles.push('color:yellow');
                
                } else {
                    helps.push('%c' + option + '%c' + description);
                    styles.push('color:green');
                    styles.push(''); // reset styles
                    
                }
            });
        
        output.log(helps.join(join) + '\n', ...styles);
    }

    /**
     * Return command description
     */
    helpDescription(): string {
        return this.description + ' [v' + this.version + ']\n';
    }

    /**
     * Return usage description
     */
    helpUsage(executable: string): string {
        return 'Usage: ' + executable + ' [COMMAND]\n';
    }

    helpOptions(): Array<string[]> {

        let commands = Object.keys(this._commands);
        let max = Math.max(
            ...commands.map(command => command.length)
        );
        
        return commands.sort().map(command => {
            
            let space = repeat(' ', max - command.length + TAB_SIZE);
            
            return [command + space, this._commands[command].description];
        });
    }
}