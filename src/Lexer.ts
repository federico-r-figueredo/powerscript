import Token from './Token';
import TokenType from './TokenType';
import ErrorHandler from './ErrorHandler';
import LiteralValue from './LiteralValue';

const keywords = new Map([
    ['and', TokenType.And],
    ['class', TokenType.Class],
    ['else', TokenType.Else],
    ['false', TokenType.False],
    ['for', TokenType.For],
    ['function', TokenType.Function],
    ['if', TokenType.If],
    ['null', TokenType.Null],
    ['or', TokenType.Or],
    ['return', TokenType.Return],
    ['super', TokenType.Super],
    ['this', TokenType.This],
    ['true', TokenType.True],
    ['let', TokenType.Let],
    ['while', TokenType.While]
]);

export default class Lexer {
    private readonly source: string;
    private error: ErrorHandler;

    private readonly tokens: Token[];
    private start: number;
    private current: number;
    private line: number;

    constructor(source: string, error: ErrorHandler) {
        this.source = source;
        this.error = error;

        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
        return this.tokens;
    }

    isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    scanToken(): void {
        const char: string = this.advance();

        switch (char) {
            case '(':
                this.addToken(TokenType.LeftParenthesis);
                break;
            case ')':
                this.addToken(TokenType.RightParenthesis);
                break;
            case '{':
                this.addToken(TokenType.LeftBrace);
                break;
            case '{':
                this.addToken(TokenType.RightBrace);
                break;
            case ',':
                this.addToken(TokenType.Comma);
                break;
            case '.':
                this.addToken(TokenType.Dot);
                break;
            case '-':
                this.addToken(TokenType.Minus);
                break;
            case '+':
                this.addToken(TokenType.Plus);
                break;
            case ';':
                this.addToken(TokenType.Semicolon);
                break;
            case '*':
                this.addToken(TokenType.Star);
                break;
            case ',':
                this.addToken(TokenType.Comma);
                break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BangEqual : TokenType.Bang);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EqualEqual : TokenType.Equal);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LessEqual : TokenType.Less);
                break;
            case '>':
                this.addToken(
                    this.match('=') ? TokenType.GreaterEqual : TokenType.Greater
                );
                break;
            case '/':
                if (this.match('/')) {
                    // A commnet goes until the end of the line
                    while (this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else if (this.match('*')) {
                    this.blockComment();
                } else {
                    this.addToken(TokenType.Slash);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;
            case '\n':
                this.line += 1;
                break;
            case '"':
                this.string();
                break;
            default:
                if (isDigit(char)) {
                    this.number();
                } else if (isAlphabetic(char)) {
                    this.identifier();
                } else {
                    this.error(
                        this.line,
                        `Unexpected character: ${JSON.stringify(char)}`
                    );
                }
        }
    }

    blockComment() {
        while (!(this.match('*') && this.match('/')) && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        // Unterminated string
        if (this.isAtEnd()) {
            this.error(this.line, 'Unterminated block comment');
            return;
        }
    }

    advance(): string {
        return this.source.charAt(this.current++);
    }

    addToken(tokenType: TokenType, literal: LiteralValue = null): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(tokenType, text, literal, this.line));
    }

    match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;

        this.current += 1;
        return true;
    }

    peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    string(): void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        // Unterminated string
        if (this.isAtEnd()) {
            this.error(this.line, 'Unterminated string');
            return;
        }

        // The closing "
        this.advance();

        // Trim the surrounding quotes
        const value: string = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.String, value);
    }

    number(): void {
        while (isDigit(this.peek())) this.advance();

        // Look for fractional part
        if (this.peek() === '.' && isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();

            while (isDigit(this.peek())) this.advance();
        }

        this.addToken(
            TokenType.Number,
            parseFloat(this.source.substring(this.start, this.current))
        );
    }

    peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    identifier(): void {
        while (isAlphanumeric(this.peek())) this.advance();

        const text: string = this.source.substring(this.start, this.current);
        this.addToken(keywords.get(text) || TokenType.Identifier);
    }
}

function isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
}

function isAlphabetic(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
}

function isAlphanumeric(char: string): boolean {
    return isAlphabetic(char) || isDigit(char);
}
