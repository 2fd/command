/**
 * Minimal ambient declarations for the Node.js APIs used by this project.
 * Replaces `@types/node` so `typescript` stays the only devDependency.
 */

declare var process: {
    env: any;
    platform: string;
    execPath: string;
    version: string;
    exitCode: number;
    cwd(): string;
    on(event: string, listener: (...args: any[]) => void): any;
};

declare var __filename: string;
declare var __dirname: string;

declare var require: {
    (id: string): any;
    resolve(id: string): string;
};

declare module 'path' {
    export function basename(path: string, ext?: string): string;
    export function dirname(path: string): string;
    export function join(...paths: string[]): string;
    export function relative(from: string, to: string): string;
    export function resolve(...paths: string[]): string;
}

declare module 'util' {
    export function format(format: any, ...params: any[]): string;
    export function inspect(object: any, options?: any): string;
}

declare module 'fs' {
    export function readdirSync(path: string): string[];
    export function statSync(path: string): { isDirectory(): boolean };
}

declare module 'assert' {
    export class AssertionError extends Error {
        constructor(options: {
            message?: string;
            actual?: any;
            expected?: any;
            operator?: string;
        });
    }
}
