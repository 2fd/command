import {expect} from 'chai';
import {basename} from 'path';
import {ArgvInput, Formatter, ColorFormatter} from '../../../lib/command/io';

describe('./lib/command/io', () => {

    describe('ArgvInput', () => {

        it('is initialize whith Array<strign>', () => {

            let emptyInput = new ArgvInput([]);
            let input = new ArgvInput(['--flag', 'param']);

            expect(emptyInput).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });

            expect(input).to.be.deep.equal({
                argv: ['--flag', 'param'],
                exec: [],
                flags: {},
                params: {},
            });
        });


        it('ignore execPath and entrypoint', () => {

            let input = new ArgvInput([process.execPath, 'entry-file.js', '--flag', 'param']);

            expect(input).to.be.deep.equal({
                argv: ['--flag', 'param'],
                exec: [
                    basename(process.execPath),
                    'entry-file.js'
                ],
                flags: {},
                params: {},
            });
        });
    });
});