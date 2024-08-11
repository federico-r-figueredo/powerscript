import ErrorHandler from './ErrorHandler';
import Token from './Token';
import TokenType from './TokenType';
import {
    Expression,
    BinaryExpression,
    GroupingExpression,
    LiteralExpression,
    UnaryExpression
} from './Expression';

class ParseError extends Error {}

export default class Parser {
    private current: number;
    private readonly tokens: Token[];
    private readonly error: ErrorHandler;

    constructor(tokens: Token[], error: ErrorHandler) {
        this.current = 0;
        this.tokens = tokens;
        this.error = error;
    }

    public parse(): Expression | null {
        try {
            return this.expression();
        } catch (error) {
            if (error instanceof ParseError) {
                return null;
            }

            throw error;
        }
    }

    private expression(): Expression {
        return this.equality();
    }

    private equality(): Expression {
        let left: Expression = this.comparison();

        while (this.match(TokenType.BangEqual, TokenType.EqualEqual)) {
            const operator: Token = this.previous();
            const right: Expression = this.comparison();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private comparison(): Expression {
        let left: Expression = this.addition();

        while (
            this.match(
                TokenType.Greater,
                TokenType.GreaterEqual,
                TokenType.Less,
                TokenType.LessEqual
            )
        ) {
            const operator = this.previous();
            const right = this.addition();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private addition(): Expression {
        let left: Expression = this.multiplication();

        while (this.match(TokenType.Plus, TokenType.Minus)) {
            const operator = this.previous();
            const right = this.multiplication();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private multiplication(): Expression {
        let left: Expression = this.unary();

        while (this.match(TokenType.Slash, TokenType.Star)) {
            const operator = this.previous();
            const right = this.unary();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private unary(): Expression {
        if (this.match(TokenType.Bang, TokenType.Minus)) {
            const operator = this.previous();
            const right = this.unary();
            return new UnaryExpression(operator, right);
        }

        return this.primary();
    }

    private primary(): Expression {
        if (this.match(TokenType.False)) return new LiteralExpression(false);
        if (this.match(TokenType.True)) return new LiteralExpression(true);
        if (this.match(TokenType.Null)) return new LiteralExpression(null);

        if (this.match(TokenType.Number, TokenType.String)) {
            return new LiteralExpression(this.previous().literal);
        }

        if (this.match(TokenType.LeftParenthesis)) {
            const expression = this.expression();
            this.consume(TokenType.RightParenthesis, "Expect ')' after expression");
            return new GroupingExpression(expression);
        }

        throw this.parseError(this.peek(), 'Expect expression');
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();

        throw this.parseError(this.peek(), message);
    }

    private parseError(token: Token, message: string): ParseError {
        this.error(token, message);
        return new ParseError();
    }

    private synchronize(): void {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.Semicolon) return;

            switch (this.peek().type) {
                case TokenType.Class:
                case TokenType.Function:
                case TokenType.Let:
                case TokenType.For:
                case TokenType.If:
                case TokenType.While:
                case TokenType.Return:
                    return;
            }

            this.advance();
        }
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }
}
