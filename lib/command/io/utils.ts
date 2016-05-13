import {format} from 'util';
import {FormatterInterface} from '../../command';

const RESET = '\u001b[0m';
const CSS_TO_COMMAND = {
    'font-weight:bold': '\u001b[1m',
    'font-weight:normal': '\u001b[2m',
    'font-style:italic': '\u001b[3m',
    'text-decoration:underline': '\u001b[4m',
    'visibility:hidden': '\u001b[8m',
    'text-decoration:line-through': '\u001b[9m',
    'color:black': '\u001b[30m',
    'color:red': '\u001b[31m',
    'color:green': '\u001b[32m',
    'color:yellow': '\u001b[33m',
    'color:blue': '\u001b[34m',
    'color:magenta': '\u001b[35m',
    'color:cyan': '\u001b[36m',
    'color:white': '\u001b[37m',
    'color:gray': '\u001b[90m',
    'color:grey': '\u001b[90m',
    'background:black': '\u001b[40m',
    'background:red': '\u001b[41m',
    'background:green': '\u001b[42m',
    'background:yellow': '\u001b[43m',
    'background:blue': '\u001b[44m',
    'background:magenta': '\u001b[45m',
    'background:cyan': '\u001b[46m',
    'background:white': '\u001b[47m',
    'background-color:black': '\u001b[40m',
    'background-color:red': '\u001b[41m',
    'background-color:green': '\u001b[42m',
    'background-color:yellow': '\u001b[43m',
    'background-color:blue': '\u001b[44m',
    'background-color:magenta': '\u001b[45m',
    'background-color:cyan': '\u001b[46m',
    'background-color:white': '\u001b[47m',
};

export class Formatter {
    
    reset: string = RESET;
    
    constructor(reset: string = ''){
        this.reset = this.translate(reset);
    }
    
    translate(styles: string): string {
        return '';
    }
    
    /**
     * The first argument is a string that contains zero or more placeholders.
     * Each placeholder is replaced with the converted value from its
     * corresponding argument. Supported placeholders are:
     *  %s - Formats the value as a string.
     *  %d - Formats the value as a number (both integer and float).
     *  %i - Formats the value as an integer.
     *  %f - Formats the value as an integer.
     *  %c - Formats the output string according to CSS styles you provide.
     *  %j | %o | %O - JSON. Replaced with the string '[Circular]' if the argument contains circular references
     *  %% - single percent sign ('%'). This does not consume an argument.
     * 
     * @see https://nodejs.org/api/util.html#util_util_format_format
     * @see https://developer.chrome.com/devtools/docs/console-api#consolelogobject-object
     */
    format(str: string, ...replacements: Array<any>): string {
    
        let finalReplacement: typeof replacements = [];
        replacements = replacements.slice();
        
        let finalStr = str.replace(/(%+[c|j|d|s|%])/g, (match: string) => {
            
            // ignore if no more replacements
            if (replacements.length === 0)
                return match;
                
            // ignore if match is escaped
            if(match.length % 2 === 1)
                return match;
            
            // extract replacement value
            let replacement = replacements.shift();
            let placeholder = match.slice(-2);
            let percentages = match.slice(0, -2);
            
            switch(placeholder){
                    
                case '%o': // chrome object placeholder
                case '%O': // chrome object placeholder
                    finalReplacement.push(replacement);
                    placeholder = '%j';
                    break;
                
                case '%c': // chrome style placeholder
                    finalReplacement.push(this.translate(replacement));
                    placeholder = '%s';
                    break;
                    
                case '%i': // chrome integer placeholder
                    finalReplacement.push(parseInt(replacement));
                    placeholder = '%d';
                    break;
                    
                case '%f': // chrome float placeholder
                    finalReplacement.push(parseFloat(replacement));
                    placeholder = '%d';
                    break;
                    
                case '%j': // node object placeholder
                case '%s': // node string placeholder
                case '%d': // node number placeholder
                    finalReplacement.push(replacement);
                    break;
                    
                default: // not consume an argument.
                    replacements.push(replacement);
            }
            
            return percentages + placeholder;
        });
        
        // native format
        return format(finalStr + RESET, ...finalReplacement);
    }
}

export class ColorFormatter extends Formatter {
    
    translate(styles: string): string {
        
        if(typeof styles !== 'string')
            return this.reset;
        
        let commandStyles = styles
            .split(';')
            .map((value) => {
                
                let css = value
                    .replace(/\s+/g, '')
                    .replace(/\/\*[.*]\*\//g, '')
                    .toLowerCase();
                
                if(CSS_TO_COMMAND[css])
                    return CSS_TO_COMMAND[css];
                
                return '';
            })
            .join('');
        
        return this.reset + commandStyles;
    }
}