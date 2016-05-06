import {InputInterface, OutputInterface} from '../../command';

export class DummyOutput implements OutputInterface {
    log(): void { }
}

export class ConsoleOutput implements OutputInterface {

    log(msj: string, ...obj: Array<any>): void {
        console.log(msj, ...obj);
    }

}