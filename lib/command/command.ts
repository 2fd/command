import {
    ParamInterface,
    FlagInterface,
    CommandType,
    CommandTypeList,
    InputValueList,
    InputInterface,
    OutputInterface,
    CommandInterface
} from '../command';

import {
    HelpFlag
} from  './flags';

import {repeat, TAB_SIZE} from './helper';

/**
 * Base implementation from command
 */
export class Command implements CommandInterface {

    /**
     * Falg index
     */
    _flags: { [option: string]: FlagInterface } = {};

    /**
     * Enable command strict mode:
     *
     * throws Error if:
     * - try overwrite a flag
     * - use a option not defined in options list
     */
    strict: boolean;

    /**
     * Describe command behavior
     */
    description: string;

    /**
     * Parameter definition
     */
    params: ParamInterface<InputValueList>;

    /**
     * Flag list
     */
    flags: Array<FlagInterface>;

    /**
     * Help flag
     */
    helpFlag: FlagInterface;

    /**
     * @abstract
     */
    action(input: InputInterface, output: OutputInterface): void {
        throw new Error('Command must be implement action method');
    };

    /**
     * Add option list and help flags to flag index
     */
    initialize() {
        this.helpFlag = this.helpFlag || new HelpFlag;
        this.flags.push(this.helpFlag);
        this.flags.forEach((flag) => this.addFlag(flag));
    };

    /**
     * Add option to flag index
     */
    addFlag(flag: FlagInterface): this {

        let flags = flag.list;

        flags.forEach((flags: string) => {
            if (this.strict && this._flags[flags])
                throw new Error(`Cannot overwrite flag ${flags} in strict mode`);

            this._flags[flags] = flag;
        });

        return this;
    }

    /**
     * Parse input and call action method
     */
    handle(input: InputInterface, output: OutputInterface): void {

        this.initialize();

        this.flags.forEach(option => option.before(input, output));

        while (input.argv.length > 0) {

            let param = input.argv.shift();

            param[0] === '-' ?
                this.parseFlag(param, input, output) :
                this.params.push(param);
        }

        if (input.flags[this.helpFlag.name]) {
            this.help(input, output);

        } else {
            input.params = this.params.get();
            this.flags.forEach(flag => flag.after(input, output));
            this.action(input, output);
        }
    }

    /**
     * Print help info from command
     */
    help(input: InputInterface, output: OutputInterface): void {

        output.log([
            '',
            this.helpUsage(input),
            this.helpDescription(),
            this.helpFlagList(input)
        ].join('\n'));
    }

    /**
     * Return usage description
     */
    helpUsage(input: InputInterface): string {

        let hasFlags = this.flags
            .filter(flag => !!flag.list.length)
            .length;

        let execution = input.exec.join(' ');
        let options = hasFlags ? '[OPTIONS]' : '';
        let paramDefinition = this.params.definition;

        return repeat(' ', TAB_SIZE) + `Usage: ${execution} ${options} ${paramDefinition} \n`;
    }
    
    /**
     * Return command description
     */
    helpDescription(): string {

        if (this.description)
            return repeat(' ', TAB_SIZE) + this.description + '\n';

        return '';
    }

    /**
     * Return flags description
     */
    helpFlagList(input: InputInterface): string {

        let flags = this.flags
            .filter(flag => !!flag.list.length);

        let flagList = this.flags
            .map(flag => flag.list.join(', '));

        let max = Math.max(
            ...flagList.map(flags => flags.length)
        );

        return flagList.map((flag, i) => {
            let ident = repeat(' ', TAB_SIZE);
            let space = repeat(' ', max - flag.length + TAB_SIZE);

            return ident + flag + space + flags[i].description;
        }).join('\n') + '\n';
    }

    /**
     * Call parse method from option in flag index
     */
    parseFlag(flag: string, input: InputInterface, output: OutputInterface) {

        if (this._flags[flag]) {
            this._flags[flag].parse(input, output);

        } else if (this.strict) {
            throw new Error('Unexpected option: ' + flag);
        }
    }
}
