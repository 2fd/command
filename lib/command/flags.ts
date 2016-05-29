import {
    InputInterface,
    FlagInterface
} from '../interfaces';

export class NullFlag implements FlagInterface {

    name = 'NullOption';

    description = '';

    list = [];

    after() { };

    before() { };

    parse() { };
}

export class FlagConstructor {

    name: string;

    description: string;

    list: Array<string>;

    constructor(
        name?: string,
        list?: Array<string>,
        description?: string
    ) {

        if (typeof name !== 'string') {
            throw new Error('Flag name must be a string');

        } else if (name.length === 0) {
            throw new Error('Flag name must not be empty');

        } else {
            this.name = name;
        }

        if (!Array.isArray(list)) {
            throw new Error('Flag list must be an array');

        } else if (name.length === 0) {
            throw new Error('Flag list must not be empty');

        } else {
            this.list = list;
        }

        if (typeof description !== 'string') {
            throw new Error('Flag description must be a string');

        } else if (description.length === 0) {
            throw new Error('Flag description must not be empty');

        } else {
            this.description = description;
        }
    }
}

export class BooleanFlag extends FlagConstructor implements FlagInterface {

    after(input: InputInterface): void { }

    before(input: InputInterface): void {
        input.flags[this.name] = false;
    }

    parse(input: InputInterface): void {
        input.flags[this.name] = true;
    }
}

export class HelpFlag extends BooleanFlag implements FlagInterface {

    constructor(
        name = 'help',
        list = ['--help', '-h'],
        description = 'Print this help'
    ) {
        super(name, list, description);
    }
}

