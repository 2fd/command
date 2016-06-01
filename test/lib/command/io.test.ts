import {expect} from 'chai';
import {basename} from 'path';
import {ArgvInput, Formatter, ColorFormatter} from '../../../lib/command/io';
import {RESET, CSS_TO_COMMAND} from '../../../lib/command/io/utils';

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

    describe('Formatter', () => {

        let formatter = new Formatter;

        it('support string placeholder (%s)', () => {

            expect(formatter.format(
                'string:%s numericString:%s number:%s float:%s object:%s array:%s null:%s undefined:%s',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:string',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:[object Object]',
                'array:1,2,3',
                'null:null',
                'undefined:undefined'
            ].join(' '))
        })

        it('support number placeholder (%d)', () => {
            expect(formatter.format(
                'string:%d numericString:%d number:%d float:%d object:%d array:%d null:%d undefined:%d',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN'
            ].join(' '))
        })

        it('support number placeholder (%i)', () => {
            expect(formatter.format(
                'string:%i numericString:%i number:%i float:%i object:%i array:%i null:%i undefined:%i',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN'
            ].join(' '))
        })

        it('support number placeholder (%f)', () => {
            expect(formatter.format(
                'string:%f numericString:%f number:%f float:%f object:%f array:%f null:%f undefined:%f',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN'
            ].join(' '))
        })

        it('support object placeholder (%j)', () => {
            expect(formatter.format(
                'string:%j numericString:%j number:%j float:%j object:%j array:%j null:%j undefined:%j',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined'
            ].join(' '))
        })

        it('support object placeholder (%o)', () => {
            expect(formatter.format(
                'string:%o numericString:%o number:%o float:%o object:%o array:%o null:%o undefined:%o',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined'
            ].join(' '))
        })

        it('support object placeholder (%O)', () => {
            expect(formatter.format(
                'string:%O numericString:%O number:%O float:%O object:%O array:%O null:%O undefined:%O',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined'
            ].join(' '))
        })

        it('support percent sign (%%)', () => {
            expect(formatter.format(
                'string:%s string:%%s string:%%%s string:%%%%s string:%%%%%s',
                1, 2, 3
            )).to.be.eq([
                'string:1',
                'string:%s',
                'string:%2',
                'string:%%s',
                'string:%%3'
            ].join(' '))
        })

        it('ignore styles placeholder (%c)', () => {
            expect(formatter.format(
                'string:%c numericString:%c number:%c float:%c object:%c array:%c null:%c undefined:%c',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:',
                'numericString:',
                'number:',
                'float:',
                'object:',
                'array:',
                'null:',
                'undefined:'
            ].join(' '))
        })
    });

    describe('ColorFormatter', () => {

        let formatter = new ColorFormatter;

        it('support string placeholder (%s)', () => {

            expect(formatter.format(
                'string:%s numericString:%s number:%s float:%s object:%s array:%s null:%s undefined:%s',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:string',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:[object Object]',
                'array:1,2,3',
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '))
        })

        it('support number placeholder (%d)', () => {
            expect(formatter.format(
                'string:%d numericString:%d number:%d float:%d object:%d array:%d null:%d undefined:%d',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN\u001b[0m'
            ].join(' '))
        })

        it('support number placeholder (%i)', () => {
            expect(formatter.format(
                'string:%i numericString:%i number:%i float:%i object:%i array:%i null:%i undefined:%i',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN\u001b[0m'
            ].join(' '))
        })

        it('support number placeholder (%f)', () => {
            expect(formatter.format(
                'string:%f numericString:%f number:%f float:%f object:%f array:%f null:%f undefined:%f',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN\u001b[0m'
            ].join(' '))
        })

        it('support object placeholder (%j)', () => {
            expect(formatter.format(
                'string:%j numericString:%j number:%j float:%j object:%j array:%j null:%j undefined:%j',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '))
        })

        it('support object placeholder (%o)', () => {
            expect(formatter.format(
                'string:%o numericString:%o number:%o float:%o object:%o array:%o null:%o undefined:%o',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '))
        })

        it('support object placeholder (%O)', () => {
            expect(formatter.format(
                'string:%O numericString:%O number:%O float:%O object:%O array:%O null:%O undefined:%O',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '))
        })

        it('support percent sign (%%)', () => {
            expect(formatter.format(
                'string:%s string:%%s string:%%%s string:%%%%s string:%%%%%s',
                1, 2, 3
            )).to.be.eq([
                'string:1',
                'string:%s',
                'string:%2',
                'string:%%s',
                'string:%%3\u001b[0m'
            ].join(' '))
        })

        it('support styles placeholder (%c)', () => {
            expect(formatter.format(
                'string:%c numericString:%c number:%c float:%c object:%c array:%c null:%c undefined:%c',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            )).to.be.eq([
                'string:\u001b[0m',
                'numericString:\u001b[0m',
                'number:\u001b[0m',
                'float:\u001b[0m',
                'object:\u001b[0m',
                'array:\u001b[0m',
                'null:\u001b[0m',
                'undefined:\u001b[0m\u001b[0m'
            ].join(' '))
        })

        Object
            .keys(CSS_TO_COMMAND)
            .forEach((style) => {

                let code = CSS_TO_COMMAND[style];

                it(`support styles placeholder (%c: ${style})`, () => {
                    expect(formatter.format(
                        '%cStyle', style
                    )).to.be.eq(RESET + code + 'Style' + RESET)
                })
            })

        it(`support multiple styles in a single placeholder (%c)`, () => {
            expect(formatter.format(
                '%cStyles1 %cStyles2', 'font-weight:bold; color:red', 'text-decoration:underline; color:white; background-color:blue'
            )).to.be.eq(
                RESET + '\u001b[1m\u001b[31mStyles1 ' +
                RESET + '\u001b[4m\u001b[37m\u001b[44mStyles2' + RESET
                )
        })
    });
});