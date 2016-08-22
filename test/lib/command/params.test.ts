import {expect} from 'chai';
import {consume} from './utils';
import {ArgvInput} from '../../../lib/command/io/input';
import {Param, NoParams, IgnoreParams} from '../../../lib/command/params';

describe('./lib/command/param', () => {

    describe('Param', () => {

        it('accept require value', () => {

            let requireValue = new Param('val');
            let unexpectInput1 = new ArgvInput([]);
            let expectInput1 = new ArgvInput(['expect-value1']);

            expect(() => consume(requireValue, unexpectInput1))
                .to.throw(Error, 'Param val is required');

            expect(consume(requireValue, expectInput1)).to.be.deep.equal({
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

            expect(() => consume(requireMultipleValue, unexpectEmptyInput))
                .to.throw(Error, 'Param val1 is required');

            expect(() => consume(requireMultipleValue, unexpectInput2))
                .to.throw(Error, 'Param val2 is required');

            expect(consume(requireMultipleValue, expectInput2)).to.be.deep.equal({
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

            expect(consume(optionalParam, emptyParamInput)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });

            expect(consume(optionalParam, singleParamInput)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {},
                params: {
                    optionalValue: 'paramA'
                },
            });


            expect(() => consume(optionalParam, multipleParamInput))
                .to.throw(Error, 'Unexpected param: param2');
        });

        it('accep list of 1 or more values', () => {

            let requireList = new Param('...list');
            let emptyParamInput = new ArgvInput([]);
            let singleParamInput = new ArgvInput(['paramA']);
            let multipleParamInput = new ArgvInput(['param1', 'param2', 'param3']);

            expect(() => consume(requireList, emptyParamInput))
                .to.throw(Error, 'Param list is required');

            expect(consume(requireList, singleParamInput)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {},
                params: {
                    list: ['paramA']
                },
            });


            expect(consume(requireList, multipleParamInput)).to.be.deep.equal({
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

            expect(consume(requireList, emptyParamInput)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });

            expect(consume(requireList, singleParamInput)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {},
                params: {
                    list: ['paramA']
                },
            });


            expect(consume(requireList, multipleParamInput)).to.be.deep.equal({
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
            expect(() => consume(noParams, input)).to.throw(Error, 'Unexpected param: param1');

        });
    });

    describe('IgnoreParams', () => {

        it('ignore any param', () => {

            let ignoreParams = new IgnoreParams();
            let input = new ArgvInput(['param1', 'param2', 'param3']);

            expect(consume(ignoreParams, input)).to.be.deep.equal({
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });
        });
    });
});