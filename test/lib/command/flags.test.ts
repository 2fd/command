import {expect} from 'chai';
import {ArgvInput} from '../../../lib/command/io';
import {NullFlag, BoolanFlag} from '../../../lib/command/flags';

describe('./lib/command/flags', () => {

    describe('NullFlag', () => {

        it('must be empty flag list', () => {

            let nullFlag = new NullFlag();

            expect(nullFlag.list).to.be.deep.equal([]);
        });
    });

    describe('BoolanFlag', () => {

        let booleanFlag = new BoolanFlag('bool', ['--boolean', '-b'], 'Define TRUE|FALSE flag');

        it('define FALSE by default', () => {

            let input = new ArgvInput([]);
            booleanFlag.before(input);
            // booleanFlag.parse(input);
            booleanFlag.after(input);

            expect(input).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    bool: false
                },
                params: {},
            });
        });

        it('define TRUE if is parsed', () => {

            let input = new ArgvInput([]);
            booleanFlag.before(input);
            booleanFlag.parse(input);
            booleanFlag.after(input);

            expect(input).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    bool: true
                },
                params: {},
            });
        });

        it('not change the input', () => {

            let input = new ArgvInput(['param']);
            booleanFlag.before(input);
            booleanFlag.parse(input);
            booleanFlag.after(input);

            expect(input).to.be.deep.equal({
                argv: ['param'],
                exec: [],
                flags: {
                    bool: true
                },
                params: {},
            });
        });

    });

});