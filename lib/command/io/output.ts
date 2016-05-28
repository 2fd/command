import {InputInterface, OutputInterface, FormatterInterface} from '../../interfaces';
import {Formatter, ColorFormatter} from './utils';

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