import {
    QuickCommandType,
    CommandType,
    CommandTypeList,
    InputInterface,
    OutputInterface,
    CommandInterface
} from '../interfaces';

import {resolve} from 'path';
import {toString} from './helper';

function requireCommand(path: string): CommandInterface {

    let [file, name] = path.split('#');
    let filepath = file[0] === '.' ?
        resolve(file) :
        require.resolve(file);

    let command: CommandInterface | QuickCommandType = name ?
        require(filepath)[name] :
        require(filepath);

    if (typeof command === 'function') {
        return new QuickCommandProxy(<QuickCommandType>command);

    } else if (Object(command) === command) {
        return <CommandInterface>command;

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
export class StringCommandProxy implements CommandInterface {

    _path: string;

    _command: CommandInterface;

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

    handle(input: InputInterface, output: OutputInterface): void {
        this.command().handle(input, output);
    }
}

/**
 * QuickCommandProxy
 *
 *
 */
export class QuickCommandProxy implements CommandInterface {

    _quick: QuickCommandType & { description?: string };

    constructor(quick: QuickCommandType) {
        this._quick = quick;
    }

    get description(): string {
        return this._quick.description || 'quick command';
    }

    handle(input: InputInterface, output: OutputInterface): void {
        this._quick(input, output);
    }
}