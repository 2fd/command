/**
 * Loads every compiled `*.test.js` file under this directory.
 * Works on any Node.js version (see ./harness).
 */

import {readdirSync, statSync} from 'fs';
import {join} from 'path';

function findTests(dir: string): string[] {
    return readdirSync(dir)
        .sort()
        .reduce((files: string[], name: string) => {

            let path = join(dir, name);

            if (statSync(path).isDirectory())
                return files.concat(findTests(path));

            if (/\.test\.js$/.test(name))
                files.push(path);

            return files;
        }, []);
}

findTests(__dirname).forEach(file => require(file));
