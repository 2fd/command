import {
    InputInterface,
    OutputInterface,
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

export class RequireFlag implements FlagInterface {

    parsed: boolean;

    flag: FlagInterface;

    constructor(flag: FlagInterface) {
        this.flag = flag;
        this.parsed = false;
    }

    get name() {
        return this.flag.name;
    };

    get description() {
        return this.flag.description;
    }

    get list() {
        return this.flag.list;
    }

    after(input: InputInterface, output: OutputInterface): void {
        this.flag.after(input, output);

        if (!this.parsed)
            throw new Error(`Flag ${this.flag.name} (${this.flag.list.join(', ')}) is required`);
    }

    before(input: InputInterface, output: OutputInterface): void {
        this.flag.before(input, output);
    }

    parse(input: InputInterface, output: OutputInterface): void {
        this.flag.parse(input, output);
    }
}

export class ValueFlag<T> extends FlagConstructor implements FlagInterface {

    parser: (value: string) => T;

    def: T;

    constructor(
        name: string,
        list: Array<string>,
        description: string,
        parser?: (value: string) => T,
        def?: T
    ) {
        super(name, list, description);
        this.parser = parser;
        this.def = def;
    }

    after(input: InputInterface): void { }

    before(input: InputInterface): void {

        if (typeof this.def !== 'undefined')
            input.flags[this.name] = this.def;
    }

    parse(input: InputInterface): void {

        if (input.argv.length === 0 || input.argv[0][0] === '-')
            throw new Error(
                `Flag ${this.name} (${this.list.join(', ')}) expect a value`
            );

        let val = input.argv.shift();

        if (typeof this.parser === 'function')
            input.flags[this.name] = this.parser(val);

        else
            input.flags[this.name] = val;
    }
}

export class ListValueFlag<T> extends FlagConstructor implements FlagInterface {

    parser: (value: string) => T;

    def: Array<T>;

    constructor(
        name: string,
        list: Array<string>,
        description: string,
        parser?: (value: string) => T,
        def?: Array<T>
    ) {
        super(name, list, description);
        this.parser = parser;

        if (arguments.length < 5)
            this.def = [];

        else if (Array.isArray(def))
            this.def = def;

        else
            throw new Error(`Flag ${this.name} (${this.list.join(', ')}) default value must be an Array`);
    }

    after(input: InputInterface): void { }

    before(input: InputInterface): void {
        input.flags[this.name] = this.def;
    }

    parse(input: InputInterface): void {

        if (input.argv.length === 0 || input.argv[0][0] === '-')
            throw new Error(
                `Flag ${this.name} (${this.list.join(', ')}) expect a value`
            );
            
        if(input.flags[this.name] === this.def)
            input.flags[this.name] = [];

        let val = input.argv.shift();
        
        input.flags[this.name].push(
            typeof this.parser === 'function' ? this.parser(val) : val
        );
    }
}

