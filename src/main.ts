import * as fs from 'fs';
import * as readLine from 'readline';

import Token from './Token';
import TokenType from './TokenType';
import Lexer from './Lexer';
import Parser from './Parser';
import { Expression } from './Expression';
import Interpreter from './Interpreter';
import RuntimeError from './RuntimeError';

let hadError: boolean = false;
let hadRuntimeError: boolean = false;

// TODO: Adapted AST generator for statements with correct import detection
function main(args: string[]): void {
    if (args.length > 1) {
        console.log('Usage: pws [script]');
        process.exit(64);
    } else if (args.length === 1) {
        runFile(args[0]);
    } else {
        runPrompt();
    }
}

function runFile(path: string): void {
    run(fs.readFileSync(path, { encoding: 'utf8' }));

    // Indicate error in the exit code
    if (hadError) process.exit(65);
    if (hadRuntimeError) process.exit(70);
}

function runPrompt(): void {
    // process.stdin.setEncoding('utf8')
    const stdinInterface = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function nextLine(): void {
        stdinInterface.question('> ', (line) => {
            run(line);
            hadError = false;
            nextLine();
        });
    }

    nextLine();
}

export function run(source: string): void {
    const lexer: Lexer = new Lexer(source, printError);
    const tokens: Token[] = lexer.scanTokens();

    const parser: Parser = new Parser(tokens, printError);
    const expression: Expression | null = parser.parse();

    const interpreter = new Interpreter(runtimeError);
    if (expression) interpreter.interpret(expression);
}

function printError(location: number | Token, message: string): void {
    if (location instanceof Token) {
        if (location.type === TokenType.EOF) {
            report(location.line, ' at end', message);
        } else {
            report(location.line, ` at ${location.lexeme}`, message);
        }
    } else {
        report(location, '', message);
    }
    process.exit(-1);
}

function report(line: number, where: string, message: string): void {
    console.error('\x1b[31m%s\x1b[0m', `[line ${line}] Error${where}: ${message}`);
    hadError = true;
}

function runtimeError(error: RuntimeError) {
    console.log(`\x1b[31m%s\x1b[0m${error.message}\n[line ${error.token.line}]`);
    hadRuntimeError = true;
}

main(process.argv.slice(2));
