import {
    InputInterface,
    OutputInterface,
    FlagInterface
} from '../interfaces';

export class NullFlag implements FlagInterface<void> {

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

export class BooleanFlag<F> extends FlagConstructor implements FlagInterface<F> {

    after(input: InputInterface<F, any>, output: OutputInterface): void { }

    before(input: InputInterface<F, any>, output: OutputInterface): void {
        input.flags[this.name] = false;
    }

    parse(flag: string, input: InputInterface<F, any>, output: OutputInterface): void {
        input.flags[this.name] = true;
    }
}

export type HelpFlagInput = {
    help?: boolean;
}

export class HelpFlag extends BooleanFlag<HelpFlagInput> implements FlagInterface<HelpFlagInput> {

    constructor() {
        super('help', ['-h', '--help'], 'Print this help');
    }
}

export class RequireFlag<F> implements FlagInterface<F> {

    flag: FlagInterface<F>;

    constructor(flag: FlagInterface<F>) {
        this.flag = flag;
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

    after(input: InputInterface<any, any>, output: OutputInterface): void {
        this.flag.after(input, output);
        let value = input.flags[this.name];

        if (
            value === undefined || value === null ||
            (typeof value === 'number' && isNaN(value)) ||
            value.length === 0
        )
            throw new Error(`Flag ${this.flag.name} (${this.flag.list.join(', ')}) is required`);
    }

    before(input: InputInterface<any, any>, output: OutputInterface): void {
        this.flag.before(input, output);
    }

    parse(flag: string, input: InputInterface<any, any>, output: OutputInterface): void {
        this.flag.parse(flag, input, output);
    }
}

export class ValueFlag<T> extends FlagConstructor implements FlagInterface<any> {

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

    after(input: InputInterface<any, any>, output: OutputInterface): void { }

    before(input: InputInterface<any, any>, output: OutputInterface): void {
        if (typeof this.def !== 'undefined')
            input.flags[this.name] = this.def;
    }

    parse(falg: string, input: InputInterface<any, any>, output: OutputInterface): void {

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

export class ListValueFlag<T> extends FlagConstructor implements FlagInterface<any> {

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

    after(input: InputInterface<any, any>, output: OutputInterface): void {
        if (input.flags[this.name].length === 0)
            input.flags[this.name] = this.def;
    }

    before(input: InputInterface<any, any>, output: OutputInterface): void {
        input.flags[this.name] = [];
    }

    parse(flag: string, input: InputInterface<any, any>, output: OutputInterface): void {

        if (input.argv.length === 0 || input.argv[0][0] === '-')
            throw new Error(
                `Flag ${this.name} (${this.list.join(', ')}) expect a value`
            );

        let val = input.argv.shift();

        input.flags[this.name].push(
            typeof this.parser === 'function' ? this.parser(val) : val
        );
    }
}

