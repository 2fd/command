import {
    QuickCommandType,
    CommandType,
    InputInterface,
    OutputInterface,
    CommandInterface
} from '../interfaces';

import {resolve} from 'path';
import {toString} from './utils';

function requireCommand(path: string): CommandInterface<any, any> {

    let [file, name] = path.split('#');
    let filepath = file[0] === '.' ?
        resolve(file) :
        require.resolve(file);

    let command: CommandInterface<any, any> | QuickCommandType = name ?
        require(filepath)[name] :
        require(filepath);

    if (typeof command === 'function') {
        return new QuickCommandProxy(command as QuickCommandType);

    } else if (Object(command) === command) {
        return command as CommandInterface<any, any>;

    } else if (name && command === undefined) {
        throw new Error(name + ' not found in ' + path);
        
    } else {
        throw new Error(
            'Unexpected command type resolve: ' + path +
            ' must be a funtion|object instance instead of ' + toString(command)
        );
    }
}

/**
 * StringCommandProxy
 */
export class StringCommandProxy implements CommandInterface<any, any> {

    _path: string;

    _command:  CommandInterface<any, any>;

    constructor(path: string) {
        this._path = path;
    }

    command() {
        if (!this._command)
            this._command = requireCommand(this._path);

        return this._command;
    }

    get description(): string {
        return this.command().description;
    }

    handle(input, output): void {
        this.command().handle(input, output);
    }
}

/**
 * QuickCommandProxy
 *
 *
 */
export class QuickCommandProxy implements CommandInterface<any, any> {

    _quick: QuickCommandType & { description?: string };

    constructor(quick: QuickCommandType) {
        this._quick = quick;
    }

    get description(): string {
        return this._quick.description || '-';
    }

    handle(input, output): void {
        this._quick(input, output);
    }
}