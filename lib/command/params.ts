import {format} from 'util';
import {ParamInterface, InputInterface, OutputInterface} from '../interfaces';

export class ParamValue {
    name: string;
    isRequired: boolean;
    isList: boolean;

    constructor(definition: string){

        // is require?
        if (definition[0] === '[' && definition.slice(-1) === ']') {
            definition = definition.slice(1, -1);
            this.isRequired = false;
        } else {
            this.isRequired = true;
        }

        // is list?
        if (
            definition[0] === '.' &&
            definition[1] === '.' &&
            definition[2] === '.'
        ) {
            definition = definition.slice(3);
            this.isList = true;
        } else {
            this.isList = false;

        }

        this.name = definition;
    }

    parse(param: string, input: InputInterface<any, any>, output: OutputInterface): boolean {

        if(this.isList) {
            let list = input.params[this.name] || [];
            list.push(param);
            input.params[this.name] = list;
            return true;

        } else if(!(this.name in input.params)) {
            input.params[this.name] = param;
            return true;
        }

        return false;
    }

    validate(input: InputInterface<any, any>, output: OutputInterface){

        if(!this.isRequired) {
            return true;

        } else if (
            this.isList &&
            Array.isArray(input.params[this.name]) &&
            input.params[this.name].length > 0
        ) {
            return true;

        } else if(
            this.name in input.params &&
            input.params !== ''
        ) {
            return true;
        }

        return false;
    }
    
}

/**
 * Usage:
 *  new Param('')
 *  new Param('requireValue')
 *  new Param('...requireListValue')
 *  new Param('[optionalValue]')
 *  new Param('[...optionalListValue]')
 *  new Param('requireValue1 requireValue2 [optionalValue] [...optionalListValue]')
 */
export class Param<P> implements ParamInterface<P> {

    definition: string;

    values: ParamValue[] = [];

    constructor(definition: string) {

        if(typeof definition !== 'string' || definition === '')
            throw new Error(
                format('Invalid Param definition: %j', definition)
            );

        this.definition = definition;
        
        this.values = definition
            .split(/\s+/i)
            .map(def => new ParamValue(def));
    }

    after(input: InputInterface<any, any>, output: OutputInterface){
        
        this
            .values
            .forEach(value => {

                if(!value.validate(input, output))
                    throw new Error(
                        format('Param %s is required', value.name)
                    );
            })
    }

    before(input: InputInterface<any, any>, output: OutputInterface){}

    parse(param: string, input: InputInterface<any, any>, output: OutputInterface): void {

        let parsed = this
            .values
            .some((value: ParamValue) => value.parse(param, input, output));

        if(!parsed)
            throw new Error('Unexpected param: ' + param);
    }
}

/**
 * 
 */
export class NoParams implements ParamInterface<{}> {

    definition = '';

    after(input: InputInterface<any, any>, output: OutputInterface){}

    before(input: InputInterface<any, any>, output: OutputInterface){}

    parse(param: string, input: InputInterface<any, any>, output: OutputInterface): void {
        throw new Error('Unexpected param: ' + param);
    }
}

export class IgnoreParams implements ParamInterface<{}> {

    definition = '';

    after(input: InputInterface<any, any>, output: OutputInterface){}

    before(input: InputInterface<any, any>, output: OutputInterface){}

    parse(param: string, input: InputInterface<any, any>, output: OutputInterface): void { }
}