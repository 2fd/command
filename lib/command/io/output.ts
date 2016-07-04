import {InputInterface, OutputInterface, FormatterInterface} from '../../interfaces';
import {Formatter, ColorFormatter} from './utils';


/**
 * Output from test
 */
export type logger = (msj: string, ...replacements: Array<any>) => void;

export class OuputExpected implements OutputInterface {

    count = 0;

    expectations: Array<logger>;

    constructor(expectations: Array<logger>) {
        this.expectations = expectations;
    }

    log(msj: string, ...replacements: Array<any>) {

        let expect = this.expectations[this.count];

        if (typeof expect !== 'function')
            throw new Error('Unexpected output');

        expect(msj, ...replacements);
        this.count++;
    }

    error(msj: string, ...replacements: Array<any>) {
        this.log(msj, ...replacements);
    }
}

/**
 * Ignore all output
 */
export class DummyOutput implements OutputInterface {
    log(): void { }
    error(): void { }
}

export class ConsoleOutput implements OutputInterface {

    formatter: FormatterInterface = new Formatter;

    log(msj: string, ...obj: Array<any>): void {
        console.log(
            this.formatter.format(msj, ...obj)
        );
    }

    error(msj: string, ...obj: Array<any>): void {
        console.error(
            this.formatter.format(msj, ...obj)
        );
    }
}

export class ColorConsoleOutput implements OutputInterface {

    formatters = {
        log: new ColorFormatter,
        error: new ColorFormatter('color:red'),
    };

    log(msj: string, ...obj: Array<any>): void {
        console.log(
            this.formatters.log.format(msj, ...obj)
        );
    }

    error(msj: string, ...obj: Array<any>): void {
        console.error(
            this.formatters.error.format(msj, ...obj)
        );
    }
}