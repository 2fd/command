import {InputInterface, OutputInterface} from '../../interfaces';
import {basename} from 'path';

export class ArgvInput implements InputInterface {

    flags = {};

    params = {};

    exec: Array<string>;

    argv: Array<string>;

    constructor(argv: Array<string>) {

        let args = argv.slice();
        let exec = [];

        if (argv[0] === process.execPath) {
            let execPath = args.shift();
            let entrypoint = args.shift();

            exec.push(basename(execPath));
            exec.push(entrypoint);
        }

        this.exec = exec;
        this.argv = args;
    }
}