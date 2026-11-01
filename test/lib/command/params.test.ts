import {describe, it, assert} from '../../harness';
import {consume, plain} from './utils';
import {ArgvInput} from '../../../lib/command/io/input';
import {Param, NoParams, IgnoreParams} from '../../../lib/command/params';

describe('./lib/command/param', () => {

    describe('Param', () => {

        it('accept require value', () => {

            let requireValue = new Param('val');
            let unexpectInput1 = new ArgvInput([]);
            let expectInput1 = new ArgvInput(['expect-value1']);

            assert.throws(() => consume(requireValue, unexpectInput1),
                { message: 'Param val is required' });

            assert.deepStrictEqual(plain(consume(requireValue, expectInput1)), {
                argv: [],
                exec: [],
                flags: {},
                params: {
                    val: 'expect-value1'
                },
            });


            let requireMultipleValue = new Param('val1 val2');
            let unexpectEmptyInput = new ArgvInput([]);
            let unexpectInput2 = new ArgvInput(['expect-value1']);
            let expectInput2 = new ArgvInput(['expect-value1', 'expect-value2']);

            assert.throws(() => consume(requireMultipleValue, unexpectEmptyInput),
                { message: 'Param val1 is required' });

            assert.throws(() => consume(requireMultipleValue, unexpectInput2),
                { message: 'Param val2 is required' });

            assert.deepStrictEqual(plain(consume(requireMultipleValue, expectInput2)), {
                argv: [],
                exec: [],
                flags: {},
                params: {
                    val1: 'expect-value1',
                    val2: 'expect-value2',
                },
            });

        });

        it('accept optional value', () => {

            let optionalParam = new Param('[optionalValue]');
            let emptyParamInput = new ArgvInput([]);
            let singleParamInput = new ArgvInput(['paramA']);
            let multipleParamInput = new ArgvInput(['param1', 'param2', 'param3']);

            assert.deepStrictEqual(plain(consume(optionalParam, emptyParamInput)), {
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });

            assert.deepStrictEqual(plain(consume(optionalParam, singleParamInput)), {
                argv: [],
                exec: [],
                flags: {},
                params: {
                    optionalValue: 'paramA'
                },
            });


            assert.throws(() => consume(optionalParam, multipleParamInput),
                { message: 'Unexpected param: param2' });
        });

        it('accep list of 1 or more values', () => {

            let requireList = new Param('...list');
            let emptyParamInput = new ArgvInput([]);
            let singleParamInput = new ArgvInput(['paramA']);
            let multipleParamInput = new ArgvInput(['param1', 'param2', 'param3']);

            assert.throws(() => consume(requireList, emptyParamInput),
                { message: 'Param list is required' });

            assert.deepStrictEqual(plain(consume(requireList, singleParamInput)), {
                argv: [],
                exec: [],
                flags: {},
                params: {
                    list: ['paramA']
                },
            });


            assert.deepStrictEqual(plain(consume(requireList, multipleParamInput)), {
                argv: [],
                exec: [],
                flags: {},
                params: {
                    list: ['param1', 'param2', 'param3']
                },
            });
        });

        it('accep list of 0 or more values', () => {

            let requireList = new Param('[...list]');
            let emptyParamInput = new ArgvInput([]);
            let singleParamInput = new ArgvInput(['paramA']);
            let multipleParamInput = new ArgvInput(['param1', 'param2', 'param3']);

            assert.deepStrictEqual(plain(consume(requireList, emptyParamInput)), {
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });

            assert.deepStrictEqual(plain(consume(requireList, singleParamInput)), {
                argv: [],
                exec: [],
                flags: {},
                params: {
                    list: ['paramA']
                },
            });


            assert.deepStrictEqual(plain(consume(requireList, multipleParamInput)), {
                argv: [],
                exec: [],
                flags: {},
                params: {
                    list: ['param1', 'param2', 'param3']
                },
            });
        });
    });

    describe('NoParams', () => {

        it('throw error if push any param', () => {

            let noParams = new NoParams();
            let input = new ArgvInput(['param1']);
            assert.throws(() => consume(noParams, input), { message: 'Unexpected param: param1' });

        });
    });

    describe('IgnoreParams', () => {

        it('ignore any param', () => {

            let ignoreParams = new IgnoreParams();
            let input = new ArgvInput(['param1', 'param2', 'param3']);

            assert.deepStrictEqual(plain(consume(ignoreParams, input)), {
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });
        });
    });
});