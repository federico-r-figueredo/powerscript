import * as fs from 'fs';
import * as readLine from 'readline';

import Token from './Token';
import TokenType from './TokenType';
import Lexer from './Lexer';
import Parser from './Parser';
import Interpreter from './Interpreter';
import RuntimeError from './RuntimeError';
import Statement, { ExpressionStatement, PrintStatement } from './Statement';

export default class PowerScript {
    private readonly interpreter = new Interpreter(this);

    private hadError: boolean = false;
    private hadRuntimeError: boolean = false;

    public runFile(path: string): void {
        this.run(fs.readFileSync(path, { encoding: 'utf8' }));

        // Indicate error in the exit code
        if (this.hadError) process.exit(65);
        if (this.hadRuntimeError) process.exit(70);
    }

    public runPrompt(): void {
        // process.stdin.setEncoding('utf8')
        const stdinInterface = readLine.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const nextLine = (): void => {
            stdinInterface.question('> ', (line) => {
                this.run(line, true);
                this.hadError = false;
                nextLine();
            });
        };

        nextLine();
    }

    public run(source: string, isREPL: boolean = false): void {
        const lexer: Lexer = new Lexer(this, source);
        const tokens: Token[] = lexer.scanTokens();

        const parser: Parser = new Parser(this, tokens);
        const statements: Statement[] | null = parser.parse();

        if (statements) {
            const lastStatement: Statement = statements[statements.length - 1];
            if (isREPL && lastStatement instanceof ExpressionStatement) {
                statements[statements.length - 1] = new PrintStatement(
                    lastStatement.expression
                );
            }

            this.interpreter.interpret(statements);
        }
    }

    public lexingError(location: number | Token, message: string): void {
        if (location instanceof Token) {
            if (location.type === TokenType.EOF) {
                this.report(location.line, ' at end', message);
            } else {
                this.report(location.line, ` at '${location.lexeme}'`, message);
            }
        } else {
            this.report(location, '', message);
        }
    }

    public parsingError(location: number | Token, message: string): void {
        if (location instanceof Token) {
            if (location.type === TokenType.EOF) {
                this.report(location.line, ' at end', message);
            } else {
                this.report(location.line, ` at '${location.lexeme}'`, message);
            }
        } else {
            this.report(location, '', message);
        }
    }

    private report(line: number, where: string, message: string): void {
        this.printError(`\x1b[31m\x1b[0m[line ${line}] Error${where}: ${message}`);
        this.hadError = true;
    }

    public runtimeError(error: RuntimeError) {
        this.printError(
            `\x1b[31m\x1b[0m[line ${error.token.line}] Error: ${error.message}`
        );
        this.hadRuntimeError = true;
    }

    public printError(message: string): void {
        console.error(message);
    }

    public print(message: string): void {
        console.log(message);
    }
}
