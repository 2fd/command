import {expect} from 'chai';
import {consume} from './utils';
import {InputInterface, FlagInterface} from '../../../lib/interfaces';
import {ArgvInput, DummyOutput} from '../../../lib/command/io';
import {NullFlag, BooleanFlag, RequireFlag, ValueFlag, ListValueFlag} from '../../../lib/command/flags';

describe('./lib/command/flags', () => {

    describe('NullFlag', () => {

        it('must be empty flag list', () => {

            let nullFlag = new NullFlag();

            expect(nullFlag.list).to.be.deep.equal([]);
        });
    });

    describe('BooleanFlag', () => {

        let booleanFlag = new BooleanFlag('bool', ['--boolean', '-b'], 'Define TRUE|FALSE flag');

        it('define FALSE by default', () => {

            let input = new ArgvInput([]);
            expect(consume(booleanFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    bool: false
                },
                params: {},
            });
        });

        it('define TRUE if is parsed', () => {

            let input = new ArgvInput(['--boolean']);
            expect(consume(booleanFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    bool: true
                },
                params: {},
            });
        });

    });

    describe('ValueFlag', () => {

        let stringValueFlag = new ValueFlag<string>(
            'string-flag', ['--string', '-s'], 'string flag'
        );

        it('expect a value', () => {

            let otherFlagInput = new ArgvInput(['--string', '--otherFlag']);
            expect(() => consume(stringValueFlag, otherFlagInput))
                .throw(Error, 'Flag string-flag (--string, -s) expect a value');


            let emptyValueInput = new ArgvInput(['--string']);
            expect(() => consume(stringValueFlag, emptyValueInput))
                .throw(Error, 'Flag string-flag (--string, -s) expect a value');

        });

        it('extract value', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            expect(consume(stringValueFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['string-flag']: 'random ;)'
                },
                params: {},
            });
        });

        let parserStringValueFlag = new ValueFlag<string>(
            'parser-string-flag', ['--string', '-s'], 'string flag', (val: string) => '**' + val + '**'
        );

        it('parse value', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            expect(consume(parserStringValueFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['parser-string-flag']: '**random ;)**'
                },
                params: {},
            });
        });

        let defaultStringValueFlag = new ValueFlag<string>(
            'default-string-flag', ['--string', '-s'], 'string flag', String, 'defaultString'
        );

        it('support default value', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            expect(consume(defaultStringValueFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['default-string-flag']: 'random ;)'
                },
                params: {},
            });

            let emptyInput = new ArgvInput([]);
            expect(consume(defaultStringValueFlag, emptyInput)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['default-string-flag']: 'defaultString'
                },
                params: {},
            });
        });
    });

    describe('ListValueFlag', () => {

        let stringValueFlag = new ListValueFlag<{}>(
            'string-list-flag', ['--string', '-s'], 'string flag'
        );

        it('expect a value', () => {

            let otherFlagInput = new ArgvInput(['--string', '--otherFlag']);
            expect(() => consume(stringValueFlag, otherFlagInput))
                .throw(Error, 'Flag string-list-flag (--string, -s) expect a value');


            let emptyValueInput = new ArgvInput(['--string']);
            expect(() => consume(stringValueFlag, emptyValueInput))
                .throw(Error, 'Flag string-list-flag (--string, -s) expect a value');

        });

        it('extract values', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            expect(consume(stringValueFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['string-list-flag']: ['random ;)']
                },
                params: {},
            });

            let inputMultiple = new ArgvInput(['--string', 'random ;)', '--string', 'random 2 ;)']);
            expect(consume(stringValueFlag, inputMultiple)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['string-list-flag']: ['random ;)', 'random 2 ;)']
                },
                params: {},
            });
        });

        let parserStringValueFlag = new ListValueFlag<string>(
            'parser-string-list-flag', ['--string', '-s'], 'string flag', (val: string) => '**' + val + '**'
        );

        it('parse values', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            expect(consume(parserStringValueFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['parser-string-list-flag']: ['**random ;)**']
                },
                params: {},
            });

            let inputMultiple = new ArgvInput(['--string', 'random ;)', '--string', 'random 2 ;)']);
            expect(consume(parserStringValueFlag, inputMultiple)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['parser-string-list-flag']: ['**random ;)**', '**random 2 ;)**']
                },
                params: {},
            });
        });

        let defaultStringValueFlag = new ListValueFlag<string>(
            'default-string-list-flag', ['--string', '-s'], 'string flag', String, ['defaultString']
        );

        it('support default value', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            expect(consume(defaultStringValueFlag, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['default-string-list-flag']: ['random ;)']
                },
                params: {},
            });

            let emptyInput = new ArgvInput([]);
            expect(consume(defaultStringValueFlag, emptyInput)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {
                    ['default-string-list-flag']: ['defaultString']
                },
                params: {},
            });
        });

        it('default value must be an array', () => {

            let def: any = 'defaultString';

            expect(() => (
                new ListValueFlag(
                    'default-string-list-flag', ['--string', '-s'], 'string flag', String, def
                )
            )).throw(Error, 'Flag default-string-list-flag (--string, -s) default value must be an Array');

        });
    });

    describe('RequireFlag', () => {

        let requireFlag = new RequireFlag( new ValueFlag('require-string-flag', ['--req', '-r'], 'string value') );

        it('must be require', () => {

            let input = new ArgvInput([]);
            expect(() => consume(requireFlag, input))
                .throw(Error, 'Flag require-string-flag (--req, -r) is required');
        });
    });

});