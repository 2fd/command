import {expect} from 'chai';
import {Param, NoParams, IgnoreParams} from '../../../lib/command/params';

describe('./lib/command/param', () => {

    describe('Param', () => {

        it('accept require value', () => {

            let requireValue = new Param('val');
            let requireMultipleValue = new Param('val1 val2');
            let expectValue1 = 'expect-value1';
            let expectValue2 = 'expect-value2';

            expect(() => requireValue.get()).to.throw(Error);

            requireValue.push(expectValue1);
            expect(requireValue.get()).to.be.deep.equal({
                val: expectValue1
            });

            requireMultipleValue.push(expectValue1);
            expect(() => requireMultipleValue.get()).to.throw(Error);

            requireMultipleValue.push(expectValue2);
            expect(requireMultipleValue.get()).to.be.deep.equal({
                val1: expectValue1,
                val2: expectValue2
            });

        });

        it('accept optional value', () => {

            let optionalParamEmpty = new Param('[optionalValue]');
            let optionalParamComplete = new Param('[optionalValue]');
            let expectValue = 'expect-value';

            optionalParamComplete.push(expectValue);

            expect(optionalParamEmpty.get()).to.be.deep.equal({
                optionalValue: ''
            });

            expect(optionalParamComplete.get()).to.be.deep.equal({
                optionalValue: expectValue
            });
        });

        it('accep list value', () => {

            let requireList = new Param('...list');
            let optionalList = new Param('[...list]');

            let expectValue1 = 'expect-value1';

            expect(() => requireList.get()).to.throw(Error);
            expect(optionalList.get()).to.be.deep.equal({
                list: []
            });

            requireList.push(expectValue1);
            optionalList.push(expectValue1);
            expect(requireList.get()).to.be.deep.equal({
                list: [expectValue1]
            });
            expect(optionalList.get()).to.be.deep.equal({
                list: [expectValue1]
            });

            requireList.push(expectValue1);
            optionalList.push(expectValue1);
            expect(requireList.get()).to.be.deep.equal({
                list: [expectValue1, expectValue1]
            });
            expect(optionalList.get()).to.be.deep.equal({
                list: [expectValue1, expectValue1]
            });
        });

        it('accept strict mode', () => {

            let emptyParam = new Param('', true);
            let singleParam = new Param('param', true);

            let paramA = 'ParamA';
            let paramB = 'ParamB';
            let paramC = 'ParamC';

            expect(() => emptyParam.push(paramA)).to.throw(Error);

            singleParam.push(paramB);
            expect(() => singleParam.push(paramC)).to.throw(Error);
        });
    });

    describe('NoParams', () => {

        it('throw error if push any param', () => {

            let noParams = new NoParams();
            let paramA = 'ParamA';
            expect(() => noParams.push(paramA)).to.throw(Error);

        });
    });

    describe('IgnoreParams', () => {

        it('ignore any param', () => {

            let ignoreParams = new IgnoreParams();
            let paramA = 'ParamA';
            let paramB = 'ParamB';
            let paramC = 'ParamC';

            ignoreParams.push(paramA);
            ignoreParams.push(paramB);
            ignoreParams.push(paramC);

            expect(ignoreParams.get()).to.be.deep.equal({});

        });
    });
});