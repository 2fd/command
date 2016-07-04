import {
    ParamInterface,
    FlagInterface,
    CommandType,
    InputInterface,
    OutputInterface,
    CommandInterface
} from '../interfaces';

import {
    HelpFlag
} from  './flags';

import {repeat, TAB_SIZE} from './helper';

export class SoftCommand<F, P> implements CommandInterface<F, P> {

    /**
     * Falg index
     */
    _flags: { [option: string]: FlagInterface<F> };

    /**
     * Describe command behavior
     */
    description: string;

    /**
     * Parameter definition
     */
    params: ParamInterface<P>;

    /**
     * Flag list
     */
    flags: Array<FlagInterface<F>>;

    /**
     * Help flag
     */
    helpFlag: FlagInterface<F>;

    /**
     * @abstract
     */
    action(input: InputInterface<F, P>, output: OutputInterface): void {
        throw new Error('Command must be implement action method');
    }

    /**
     * Add option to flag index
     */
    addFlag(flag: FlagInterface<F>): this {

        flag
            .list
            .forEach((f: string) => {
                this._flags[f] = flag;
            });

        return this;
    }

    consume(input: InputInterface<F, P>, output: OutputInterface): void {

        let param = input.argv.shift();

        param[0] === '-' ?
            this.parseFlag(param, input, output) :
            this.parseParam(param, input, output);
    }

    hasToConsume(input: InputInterface<F, P>, output: OutputInterface): boolean {
        return input.argv.length > 0;
    }

    /**
     * Parse input and call action method
     */
    handle(input: InputInterface<any, any>, output: OutputInterface): void {

        this.initialize();

        this.params.before(input, output);
        this.flags.forEach(flag => flag.before(input, output));

        while (this.hasToConsume(input, output))
            this.consume(input, output);

        if (input.flags[this.helpFlag.name]) {
            this.help(input, output);

        } else {
            this.params.after(input, output);
            this.flags.forEach(flag => flag.after(input, output));
            this.action(input, output);
        }
    }

    /**
     * Print help info from command
     */
    help(input: InputInterface<F, P>, output: OutputInterface): void {

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
                let hasDescription = !!description;

                if (!hasDescription) {
                    helps.push('%c');
                    helps.push('%c' + option);
                    styles.push('');
                    styles.push('color:yellow');

                } else {
                    helps.push('%c' + option + '%c' + description);
                    styles.push('color:green');
                    styles.push(''); // reset styles

                }
            });

        output.log(helps.join(join) + '\n', ...styles)
    }

    /**
     * Return command description
     */
    helpDescription(): string {

        if (this.description)
            return this.description + '\n';

        return '';
    }

    /**
     * Return usage description
     */
    helpUsage(executable: string): string {

        let hasFlags = this.flags
            .filter(flag => !!flag.list.length)
            .length;

        let options = hasFlags ? '[OPTIONS]' : '';
        let paramDefinition = this.params.definition;

        return `Usage: ${executable} ${options} ${paramDefinition}\n`;
    }

    /**
     * Return flags description
     */
    helpOptions(): Array<string[]> {

        let flags = this.flags
            .filter(flag => !!flag.list.length);

        let flagList = this.flags
            .map(flag => flag.list.join(', '));

        let max = Math.max(
            ...flagList.map(flags => flags.length)
        );

        let helpFlags = flagList.map((flag, i) => {
            let ident = repeat(' ', TAB_SIZE);
            let space = repeat(' ', max - flag.length + TAB_SIZE);

            return [flag + space, flags[i].description];
        });

        return [
            ['OPTIONS:'],
            ...helpFlags,
        ];
    }

    /**
     * Add option list and help flags to flag index
     */
    initialize() {

        if (this._flags)
            return;

        this._flags = {}
        this.helpFlag = this.helpFlag || new HelpFlag;
        this.flags.push(this.helpFlag);
        this.flags.forEach((flag) => this.addFlag(flag));
    }

    /**
     * Call parse method from option in flag index
     */
    parseFlag(flag: string, input: InputInterface<F, P>, output: OutputInterface): void {
        this._flags[flag].parse(flag, input, output);
    }

    /**
     * 
     */
    parseParam(param: string, input: InputInterface<F, P>, output: OutputInterface): void {
        this.params.parse(param, input, output);
    }
}

/**
 * Base implementation from command
 */
export class Command<F, P> extends SoftCommand<F, P> implements CommandInterface<F, P> {

    /**
     * Add option to flag index
     */
    addFlag(flag: FlagInterface<F>): this {

        let command = (<any & { name: string }>this.constructor).name;

        flag
            .list
            .forEach((f: string) => {
                if (this._flags[f])
                    throw new Error(`Cannot overwrite flag ${f} in command ${command}`);
            });

        super.addFlag(flag);

        return this;
    }

    initialize() {

        if (this._flags)
            return;

        let command = (<any & { name: string }>this.constructor).name;

        if (!this.params)
            throw new Error('Command must be define params property');

        if (!Array.isArray(this.flags))
            throw new Error('Command must be define flag list property');

        let commands: any = {}

        this
            .flags
            .forEach(flag => {

                if (commands[flag.name])
                    throw new Error(`Cannot overwrite flag with name ${flag.name} in command ${command}`);

                commands[flag.name] = true;
            });

        super.initialize();
    }

    /**
     * Call parse method from option in flag index
     */
    parseFlag(flag: string, input: InputInterface<F, P>, output: OutputInterface) {

        if (!this._flags[flag])
            throw new Error('Unexpected option: ' + flag);

        super.parseFlag(flag, input, output);
    }
}
