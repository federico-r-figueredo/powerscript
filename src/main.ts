import * as fs from 'fs';
import * as readLine from 'readline';
import Lexer from './Lexer';
import Token from './Token';

let hadError: boolean = false;

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

    for (const token of tokens) {
        console.log(token);
    }
}

function printError(line: number, message: string): void {
    report(line, '', message);
}

function report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    hadError = true;
}

main(process.argv.slice(2));
