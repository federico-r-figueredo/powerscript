import Token from './Token';
import TokenType from './TokenType';
import ErrorHandler from './ErrorHandler';
import LiteralValue from './LiteralValue';
import PowerScript from './PowerScript';

const keywords = new Map([
    ['and', TokenType.AND],
    ['class', TokenType.CLASS],
    ['const', TokenType.CONST],
    ['else', TokenType.ELSE],
    ['false', TokenType.FALSE],
    ['for', TokenType.FOR],
    ['function', TokenType.FUNCTION],
    ['if', TokenType.IF],
    ['null', TokenType.NULL],
    ['or', TokenType.OR],
    ['print', TokenType.PRINT],
    ['return', TokenType.RETURN],
    ['super', TokenType.SUPER],
    ['this', TokenType.THIS],
    ['true', TokenType.TRUE],
    ['let', TokenType.LET],
    ['while', TokenType.WHILE]
]);

export default class Lexer {
    private readonly powerScript: PowerScript;
    private readonly source: string;

    private readonly tokens: Token[];
    private start: number;
    private current: number;
    private line: number;

    constructor(powerScript: PowerScript, source: string) {
        this.powerScript = powerScript;
        this.source = source;

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
                this.addToken(TokenType.LEFT_PARENTHESIS);
                break;
            case ')':
                this.addToken(TokenType.RIGHT_PARENTHESIS);
                break;
            case '{':
                this.addToken(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addToken(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '.':
                this.addToken(TokenType.DOT);
                break;
            case '-':
                this.addToken(TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenType.PLUS);
                break;
            case ';':
                this.addToken(TokenType.SEMICOLON);
                break;
            case '*':
                this.addToken(TokenType.STAR);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(
                    this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER
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
                    this.addToken(TokenType.SLASH);
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
                this.string('"');
                break;
            case "'":
                this.string("'");
                break;
            default:
                if (isDigit(char)) {
                    this.number();
                } else if (isAlphabetic(char)) {
                    this.identifier();
                } else {
                    this.powerScript.lexingError(
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
            this.powerScript.lexingError(this.line, 'Unterminated block comment');
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

    string(variant: string): void {
        while (this.peek() !== variant && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        // Unterminated string
        if (this.isAtEnd()) {
            this.powerScript.lexingError(this.line, 'Unterminated string');
            return;
        }

        // The closing "
        this.advance();

        // Trim the surrounding quotes
        const value: string = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
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
            TokenType.NUMBER,
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
        this.addToken(keywords.get(text) || TokenType.IDENTIFIER);
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
