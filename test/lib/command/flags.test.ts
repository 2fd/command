import {describe, it, assert} from '../../harness';
import {consume, plain} from './utils';
import {InputInterface, FlagInterface} from '../../../lib/interfaces';
import {ArgvInput, DummyOutput} from '../../../lib/command/io';
import {NullFlag, BooleanFlag, RequireFlag, ValueFlag, ListValueFlag} from '../../../lib/command/flags';

describe('./lib/command/flags', () => {

    describe('NullFlag', () => {

        it('must be empty flag list', () => {

            let nullFlag = new NullFlag();

            assert.deepStrictEqual(nullFlag.list, []);
        });
    });

    describe('BooleanFlag', () => {

        let booleanFlag = new BooleanFlag('bool', ['--boolean', '-b'], 'Define TRUE|FALSE flag');

        it('define FALSE by default', () => {

            let input = new ArgvInput([]);
            assert.deepStrictEqual(plain(consume(booleanFlag, input)), {
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
            assert.deepStrictEqual(plain(consume(booleanFlag, input)), {
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
            assert.throws(() => consume(stringValueFlag, otherFlagInput),
                { message: 'Flag string-flag (--string, -s) expect a value' });


            let emptyValueInput = new ArgvInput(['--string']);
            assert.throws(() => consume(stringValueFlag, emptyValueInput),
                { message: 'Flag string-flag (--string, -s) expect a value' });

        });

        it('extract value', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            assert.deepStrictEqual(plain(consume(stringValueFlag, input)), {
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
            assert.deepStrictEqual(plain(consume(parserStringValueFlag, input)), {
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
            assert.deepStrictEqual(plain(consume(defaultStringValueFlag, input)), {
                argv: [],
                exec: [],
                flags: {
                    ['default-string-flag']: 'random ;)'
                },
                params: {},
            });

            let emptyInput = new ArgvInput([]);
            assert.deepStrictEqual(plain(consume(defaultStringValueFlag, emptyInput)), {
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
            assert.throws(() => consume(stringValueFlag, otherFlagInput),
                { message: 'Flag string-list-flag (--string, -s) expect a value' });


            let emptyValueInput = new ArgvInput(['--string']);
            assert.throws(() => consume(stringValueFlag, emptyValueInput),
                { message: 'Flag string-list-flag (--string, -s) expect a value' });

        });

        it('extract values', () => {

            let input = new ArgvInput(['--string', 'random ;)']);
            assert.deepStrictEqual(plain(consume(stringValueFlag, input)), {
                argv: [],
                exec: [],
                flags: {
                    ['string-list-flag']: ['random ;)']
                },
                params: {},
            });

            let inputMultiple = new ArgvInput(['--string', 'random ;)', '--string', 'random 2 ;)']);
            assert.deepStrictEqual(plain(consume(stringValueFlag, inputMultiple)), {
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
            assert.deepStrictEqual(plain(consume(parserStringValueFlag, input)), {
                argv: [],
                exec: [],
                flags: {
                    ['parser-string-list-flag']: ['**random ;)**']
                },
                params: {},
            });

            let inputMultiple = new ArgvInput(['--string', 'random ;)', '--string', 'random 2 ;)']);
            assert.deepStrictEqual(plain(consume(parserStringValueFlag, inputMultiple)), {
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
            assert.deepStrictEqual(plain(consume(defaultStringValueFlag, input)), {
                argv: [],
                exec: [],
                flags: {
                    ['default-string-list-flag']: ['random ;)']
                },
                params: {},
            });

            let emptyInput = new ArgvInput([]);
            assert.deepStrictEqual(plain(consume(defaultStringValueFlag, emptyInput)), {
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

            assert.throws(() => (
                new ListValueFlag(
                    'default-string-list-flag', ['--string', '-s'], 'string flag', String, def
                )
            ), { message: 'Flag default-string-list-flag (--string, -s) default value must be an Array' });

        });
    });

    describe('RequireFlag', () => {

        let requireFlag = new RequireFlag( new ValueFlag('require-string-flag', ['--req', '-r'], 'string value') );

        it('must be require', () => {

            let input = new ArgvInput([]);
            assert.throws(() => consume(requireFlag, input),
                { message: 'Flag require-string-flag (--req, -r) is required' });
        });
    });

});