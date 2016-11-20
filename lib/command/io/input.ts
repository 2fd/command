import { InputInterface, OutputInterface } from '../../interfaces';
import { basename, relative, dirname } from 'path';


const executionPaths: string[] = process.env.PATH
    .split(process.platform === 'win32' ? ';' : ':');

export class ArgvInput implements InputInterface<any, any> {

    flags = {};

    params = {};

    exec: Array<string>;

    argv: Array<string>;

    constructor(argv: Array<string>, exec: Array<string> = []) {

        this.argv = argv.slice();
        this.exec = exec.slice();

        if (
            exec.length === 0 && // not custom
            argv[0] === process.execPath // is standar execution
        ) {
            let execPath = this.argv.shift();
            let entrypoint = this.argv.shift();

            // command exists on execution path 
            if (executionPaths.indexOf(dirname(entrypoint)) >= 0) {
                this.exec.push(basename(entrypoint));

            } else {
                this.exec.push(basename(execPath));
                this.exec.push(relative(process.cwd(), entrypoint));
            }

        }
    }
}