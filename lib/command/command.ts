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

export class SoftCommand implements CommandInterface {

    /**
     * Falg index
     */
    _flags: { [option: string]: FlagInterface };

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
    }

    /**
     * Add option list and help flags to flag index
     */
    initialize() {
        
        if(this._flags)
            return;
            
        this._flags = {}
        this.helpFlag = this.helpFlag || new HelpFlag;
        this.flags.push(this.helpFlag);
        this.flags.forEach((flag) => this.addFlag(flag));
    }

    /**
     * Add option to flag index
     */
    addFlag(flag: FlagInterface): this {

        flag
            .list
            .forEach((f: string) => {
                this._flags[f] = flag;
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

        this._flags[flag].parse(input, output);
    }
}

type FlagSet = {
    [name: string]: boolean
}

/**
 * Base implementation from command
 */
export class Command  extends SoftCommand implements CommandInterface {

    /**
     * Add option to flag index
     */
    addFlag(flag: FlagInterface): this {
        
        let command = (<any & {name: string}>this.constructor).name;

        flag
            .list
            .forEach((f: string) => {
                if (this._flags[f])
                    throw new Error(`Cannot overwrite flag ${f} in command ${command}`);
            });
        
        super.addFlag(flag);

        return this;
    }
    
    initialize(){
        
        if(this._flags)
            return;
        
        let command = (<any & {name: string}>this.constructor).name;
        
        if(!this.params)
            throw new Error('Command must be define params property');
            
        if(!Array.isArray(this.flags))
            throw new Error('Command must be define flag list property');
            
        this
            .flags
            .reduce<FlagSet>(
                (index, flag: FlagInterface): FlagSet => {
                    
                    if(index[flag.name])
                        throw new Error(`Cannot overwrite flag with name ${flag.name} in command ${command}`);
                    
                    index[flag.name] = true;
                    
                    return index;
                },
                {}
            );
        
        super.initialize();
    }

    /**
     * Call parse method from option in flag index
     */
    parseFlag(flag: string, input: InputInterface, output: OutputInterface) {

        if (!this._flags[flag])
            throw new Error('Unexpected option: ' + flag);

        super.parseFlag(flag, input, output);
    }
}
