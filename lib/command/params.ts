import {
    ParamInterface,
    InputValueList
} from '../command';

export interface ParamValue {

    require: boolean;

    name: string;

    value: string | Array<string>;
}

/**
 * Usage:
 *  new Param('')
 */
export class Param implements ParamInterface<InputValueList> {

    definition: string;

    strict: boolean;

    index = 0;

    paramValue: Array<ParamValue> = [];

    constructor(definition: string, strict = false) {

        this.definition = definition;
        this.strict = strict;

        if (definition.length)
            definition
                .split(/\s+/i)
                .forEach(def => this.setDefinitionValue(def));
    }

    setDefinitionValue(def: string) {

        let require = true;
        let list = false;

        // is require?
        if (
            def[0] === '[' &&
            def.slice(-1) === ']'
        ) {
            require = false;
            def = def.slice(1, -1);
        }

        // is list?
        if (
            def[0] === '.' &&
            def[1] === '.' &&
            def[2] === '.'
        ) {
            list = true;
            def = def.slice(3);
        }

        // push param definition
        this.paramValue.push({
            name: def,
            require: require,
            value: list ? [] : ''
        });
    }

    push(param: string): void {

        let paramValue = this.paramValue[this.index];

        if (typeof paramValue === 'undefined') {
            if (this.strict)
                throw new Error('Unexpected param: ' + param);

            // ignore

        } else if (Array.isArray(paramValue.value)) {
            let value = <Array<string>>paramValue.value;
            value.push(param);

        } else {
            paramValue.value = param;
            this.index++;
        }
    }

    get(): InputValueList {

        let paramResult: InputValueList = {};

        this.paramValue.forEach(paramValue => {

            if (
                paramValue.require &&
                paramValue.value.length === 0
            )
                throw new Error(`Param ${paramValue.name} is require`);

            paramResult[paramValue.name] = paramValue.value;
        });

        return paramResult;
    }
}

/**
 * 
 */
export class NoParams implements ParamInterface<InputValueList> {

    definition = '';

    /** Throw an error if any param is pushed */
    push(param: string): void {
        throw new Error('Unexpected param: ' + param);
    }

    get(): InputValueList {
        return {};
    }
}

export class IgnoreParams implements ParamInterface<InputValueList> {

    definition = '';

    /** Ignore any param pushed */
    push(param: string): void { }

    get(): InputValueList {
        return {};
    }
}