/**
 * Test harness without dependencies.
 *
 * On Node.js versions that provide `node:test` and `node:assert/strict`
 * (>= 18), those modules are used directly. On older versions (back to
 * 0.12) a minimal ES5 runner with the same API subset is used instead.
 *
 * Set `LEGACY_TEST_RUNNER=1` to force the legacy runner on any version.
 */

import * as coreAssert from 'assert';
import {inspect} from 'util';

export type TestFn = () => any;

export interface Assert {
    strictEqual(actual: any, expected: any, message?: string): void;
    deepStrictEqual(actual: any, expected: any, message?: string): void;
    throws(fn: () => any, expected: { message: string }): void;
    doesNotThrow(fn: () => any): void;
}

let nodeTest: any = null;
let nodeAssert: any = null;

if (!process.env.LEGACY_TEST_RUNNER) {
    try {
        nodeTest = require('node:test');
        nodeAssert = require('node:assert/strict');
    } catch (err) {
        nodeTest = null;
        nodeAssert = null;
    }
}

// ---------------------------------------------------------------------------
// Legacy assert (ES5, same semantics as `node:assert/strict` for the subset
// used in this project)
// ---------------------------------------------------------------------------

function sameValue(a: any, b: any): boolean {

    if (a === b)
        return a !== 0 || 1 / a === 1 / b; // distinguish 0 and -0

    return a !== a && b !== b; // NaN
}

function hasOwn(obj: any, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function deepSameValue(a: any, b: any): boolean {

    if (sameValue(a, b))
        return true;

    if (
        typeof a !== 'object' || a === null ||
        typeof b !== 'object' || b === null
    )
        return false;

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
        return false;

    let keysA = Object.keys(a);
    let keysB = Object.keys(b);

    if (keysA.length !== keysB.length)
        return false;

    return keysA.every(key => hasOwn(b, key) && deepSameValue(a[key], b[key]));
}

function fail(actual: any, expected: any, operator: string, message: string): void {
    throw new coreAssert.AssertionError({
        actual: actual,
        expected: expected,
        operator: operator,
        message: message,
    });
}

function diff(title: string, actual: any, expected: any): string {
    return title + ':\n' +
        '  actual:   ' + inspect(actual, { depth: null }) + '\n' +
        '  expected: ' + inspect(expected, { depth: null });
}

const legacyAssert: Assert = {

    strictEqual(actual: any, expected: any, message?: string): void {
        if (!sameValue(actual, expected))
            fail(actual, expected, 'strictEqual',
                message || diff('Expected values to be strictly equal', actual, expected));
    },

    deepStrictEqual(actual: any, expected: any, message?: string): void {
        if (!deepSameValue(actual, expected))
            fail(actual, expected, 'deepStrictEqual',
                message || diff('Expected values to be strictly deep-equal', actual, expected));
    },

    throws(fn: () => any, expected: { message: string }): void {

        let thrown = false;
        let error: any;

        try {
            fn();
        } catch (err) {
            thrown = true;
            error = err;
        }

        if (!thrown)
            fail(undefined, expected, 'throws', 'Missing expected exception.');

        if (!(error instanceof Error) || error.message !== expected.message)
            fail(error, expected, 'throws', diff(
                'Expected error message',
                error instanceof Error ? error.message : error,
                expected.message
            ));
    },

    doesNotThrow(fn: () => any): void {
        fn();
    },
};

// ---------------------------------------------------------------------------
// Legacy runner (synchronous tests only)
// ---------------------------------------------------------------------------

let depth = 0;
let passed = 0;
let failed = 0;

function indent(): string {
    return new Array(depth + 1).join('  ');
}

function report(name: string, err: any): void {
    failed++;
    process.exitCode = 1;
    console.log(indent() + '✖ ' + name);
    console.log(
        String(err && err.stack || err)
            .split('\n')
            .map(line => indent() + '    ' + line)
            .join('\n')
    );
}

function legacyDescribe(name: string, fn: TestFn): void {

    console.log(indent() + '▶ ' + name);
    depth++;

    try {
        fn();
    } catch (err) {
        report(name, err);
    }

    depth--;
}

function legacyIt(name: string, fn: TestFn): void {

    try {
        fn();
        passed++;
        console.log(indent() + '✔ ' + name);

    } catch (err) {
        report(name, err);
    }
}

if (!nodeTest) {
    process.on('exit', () => {
        console.log('');
        console.log('ℹ runner legacy (node ' + process.version + ')');
        console.log('ℹ pass ' + passed);
        console.log('ℹ fail ' + failed);
    });
}

export const describe: (name: string, fn: TestFn) => void = nodeTest ? nodeTest.describe : legacyDescribe;
export const it: (name: string, fn: TestFn) => void = nodeTest ? nodeTest.it : legacyIt;
export const assert: Assert = nodeAssert || legacyAssert;
