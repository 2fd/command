import {InputInterface, OutputInterface} from '../../interfaces';
import {basename, resolve, relative} from 'path';

export class ArgvInput implements InputInterface<any, any> {

    flags = {};

    params = {};

    exec: Array<string>;

    argv: Array<string>;

    constructor(argv: Array<string>, exec: Array<string> = []) {

        this.argv = argv.slice();
        this.exec = exec.slice();

        if ( exec.length === 0 && argv[0] === process.execPath) {
            let execPath = this.argv.shift();
            let entrypoint = this.argv.shift();

            this.exec.push(basename(execPath));
            this.exec.push(entrypoint);
        }
    }
}