import {describe, it, assert} from '../../harness';
import {plain} from './utils';
import {basename, relative} from 'path';
import {format} from 'util';
import {ArgvInput, Formatter, ColorFormatter} from '../../../lib/command/io';
import {RESET, CSS_TO_COMMAND} from '../../../lib/command/utils';

describe('./lib/command/io', () => {

    describe('ArgvInput', () => {

        it('is initialize whith Array<strign>', () => {

            let emptyInput = new ArgvInput([]);
            let input = new ArgvInput(['--flag', 'param']);

            assert.deepStrictEqual(plain(emptyInput), {
                argv: [],
                exec: [],
                flags: {},
                params: {},
            });

            assert.deepStrictEqual(plain(input), {
                argv: ['--flag', 'param'],
                exec: [],
                flags: {},
                params: {},
            });
        });

        it('Detects if it runs globally', () => {

            let input = new ArgvInput([process.execPath, '/usr/bin/command', '--flag', 'param']);

            assert.deepStrictEqual(plain(input), {
                argv: ['--flag', 'param'],
                exec: ['command'],
                flags: {},
                params: {},
            });
        });


        it('Detects if it runs locally', () => {

            let input = new ArgvInput([process.execPath, __filename, '--flag', 'param']);

            assert.deepStrictEqual(plain(input), {
                argv: ['--flag', 'param'],
                exec: [
                    basename(process.execPath),
                    relative(process.cwd(), __filename)
                ],
                flags: {},
                params: {},
            });
        });
    });

    describe('Formatter', () => {

        let formatter = new Formatter;

        it('support string placeholder (%s)', () => {

            assert.strictEqual(formatter.format(
                'string:%s numericString:%s number:%s float:%s object:%s array:%s null:%s undefined:%s',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:string',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:' + format('%s', {}), // util.format output for objects changed in Node 12
                'array:' + format('%s', [1, 2, 3]),
                'null:null',
                'undefined:undefined'
            ].join(' '));
        });

        it('support number placeholder (%d)', () => {
            assert.strictEqual(formatter.format(
                'string:%d numericString:%d number:%d float:%d object:%d array:%d null:%d undefined:%d',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN'
            ].join(' '));
        });

        it('support number placeholder (%i)', () => {
            assert.strictEqual(formatter.format(
                'string:%i numericString:%i number:%i float:%i object:%i array:%i null:%i undefined:%i',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN'
            ].join(' '));
        });

        it('support number placeholder (%f)', () => {
            assert.strictEqual(formatter.format(
                'string:%f numericString:%f number:%f float:%f object:%f array:%f null:%f undefined:%f',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN'
            ].join(' '));
        });

        it('support object placeholder (%j)', () => {
            assert.strictEqual(formatter.format(
                'string:%j numericString:%j number:%j float:%j object:%j array:%j null:%j undefined:%j',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined'
            ].join(' '));
        });

        it('support object placeholder (%o)', () => {
            assert.strictEqual(formatter.format(
                'string:%o numericString:%o number:%o float:%o object:%o array:%o null:%o undefined:%o',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined'
            ].join(' '));
        });

        it('support object placeholder (%O)', () => {
            assert.strictEqual(formatter.format(
                'string:%O numericString:%O number:%O float:%O object:%O array:%O null:%O undefined:%O',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined'
            ].join(' '));
        });

        it('support percent sign (%%)', () => {
            assert.strictEqual(formatter.format(
                'string:%s string:%%s string:%%%s string:%%%%s string:%%%%%s',
                1, 2, 3
            ), [
                'string:1',
                'string:%s',
                'string:%2',
                'string:%%s',
                'string:%%3'
            ].join(' '));
        });

        it('ignore styles placeholder (%c)', () => {
            assert.strictEqual(formatter.format(
                'string:%c numericString:%c number:%c float:%c object:%c array:%c null:%c undefined:%c',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:',
                'numericString:',
                'number:',
                'float:',
                'object:',
                'array:',
                'null:',
                'undefined:'
            ].join(' '));
        });
    });

    describe('ColorFormatter', () => {

        let formatter = new ColorFormatter;

        it('support string placeholder (%s)', () => {

            assert.strictEqual(formatter.format(
                'string:%s numericString:%s number:%s float:%s object:%s array:%s null:%s undefined:%s',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:string',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:' + format('%s', {}), // util.format output for objects changed in Node 12
                'array:' + format('%s', [1, 2, 3]),
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '));
        });

        it('support number placeholder (%d)', () => {
            assert.strictEqual(formatter.format(
                'string:%d numericString:%d number:%d float:%d object:%d array:%d null:%d undefined:%d',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN\u001b[0m'
            ].join(' '));
        });

        it('support number placeholder (%i)', () => {
            assert.strictEqual(formatter.format(
                'string:%i numericString:%i number:%i float:%i object:%i array:%i null:%i undefined:%i',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN\u001b[0m'
            ].join(' '));
        });

        it('support number placeholder (%f)', () => {
            assert.strictEqual(formatter.format(
                'string:%f numericString:%f number:%f float:%f object:%f array:%f null:%f undefined:%f',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:NaN',
                'numericString:10',
                'number:1',
                'float:2.5',
                'object:NaN',
                'array:NaN',
                'null:NaN',
                'undefined:NaN\u001b[0m'
            ].join(' '));
        });

        it('support object placeholder (%j)', () => {
            assert.strictEqual(formatter.format(
                'string:%j numericString:%j number:%j float:%j object:%j array:%j null:%j undefined:%j',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '));
        });

        it('support object placeholder (%o)', () => {
            assert.strictEqual(formatter.format(
                'string:%o numericString:%o number:%o float:%o object:%o array:%o null:%o undefined:%o',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '));
        });

        it('support object placeholder (%O)', () => {
            assert.strictEqual(formatter.format(
                'string:%O numericString:%O number:%O float:%O object:%O array:%O null:%O undefined:%O',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:"string"',
                'numericString:"10"',
                'number:1',
                'float:2.5',
                'object:{}',
                'array:[1,2,3]',
                'null:null',
                'undefined:undefined\u001b[0m'
            ].join(' '));
        });

        it('support percent sign (%%)', () => {
            assert.strictEqual(formatter.format(
                'string:%s string:%%s string:%%%s string:%%%%s string:%%%%%s',
                1, 2, 3
            ), [
                'string:1',
                'string:%s',
                'string:%2',
                'string:%%s',
                'string:%%3\u001b[0m'
            ].join(' '));
        });

        it('support styles placeholder (%c)', () => {
            assert.strictEqual(formatter.format(
                'string:%c numericString:%c number:%c float:%c object:%c array:%c null:%c undefined:%c',
                'string',
                '10',
                1,
                2.5,
                {},
                [1, 2, 3],
                null,
                undefined
            ), [
                'string:\u001b[0m',
                'numericString:\u001b[0m',
                'number:\u001b[0m',
                'float:\u001b[0m',
                'object:\u001b[0m',
                'array:\u001b[0m',
                'null:\u001b[0m',
                'undefined:\u001b[0m\u001b[0m'
            ].join(' '));
        });

        Object
            .keys(CSS_TO_COMMAND)
            .forEach((style) => {

                let code = CSS_TO_COMMAND[style];

                it(`support styles placeholder (%c: ${style})`, () => {
                    assert.strictEqual(formatter.format(
                        '%cStyle', style
                    ), RESET + code + 'Style' + RESET);
                });
            });

        it(`support multiple styles in a single placeholder (%c)`, () => {
            assert.strictEqual(formatter.format(
                '%cStyles1 %cStyles2', 'font-weight:bold; color:red', 'text-decoration:underline; color:white; background-color:blue'
            ), 
                RESET + '\u001b[1m\u001b[31mStyles1 ' +
                RESET + '\u001b[4m\u001b[37m\u001b[44mStyles2' + RESET
                );
        });
    });
});
