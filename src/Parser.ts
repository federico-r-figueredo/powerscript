import Token from './Token';
import TokenType from './TokenType';
import {
    Expression,
    BinaryExpression,
    GroupingExpression,
    LiteralExpression,
    UnaryExpression,
    VariableExpression,
    AssignmentExpression
} from './Expression';
import {
    Statement,
    StatementVisitor,
    ExpressionStatement,
    PrintStatement,
    VariableStatement,
    BlockStatement,
    IfStatement
} from './Statement';
import PowerScript from './PowerScript';

class ParseError extends Error {}

export default class Parser {
    private readonly powerScript: PowerScript;
    private readonly tokens: Token[];

    private current: number;

    constructor(powerScript: PowerScript, tokens: Token[]) {
        this.powerScript = powerScript;
        this.tokens = tokens;

        this.current = 0;
    }

    public parse(): Statement[] {
        const statements: Statement[] = [];
        while (!this.isAtEnd()) {
            const declaration = this.declaration();
            if (declaration !== null) statements.push(declaration);
        }

        return statements;
    }

    private declaration(): Statement | null {
        try {
            if (this.match(TokenType.LET)) return this.variableDeclaration();

            return this.statement();
        } catch (error) {
            if (error instanceof ParseError) {
                this.synchronize();
                return null;
            }

            throw error;
        }
    }

    private variableDeclaration(): Statement {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect variable identifier');

        const initializer = this.match(TokenType.EQUAL)
            ? this.expression()
            : new LiteralExpression(null);

        this.consume(TokenType.SEMICOLON, "Expect '; after variable declaration");

        return new VariableStatement(name, initializer);
    }

    private statement(): Statement {
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.LEFT_BRACE)) return this.blockStatement();
        if (this.match(TokenType.IF)) return this.ifStatement();

        return this.expressionStatement();
    }

    private printStatement(): Statement {
        const expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new PrintStatement(expression);
    }

    private blockStatement(): Statement {
        const statements: Statement[] = [];
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            const declaration = this.declaration();
            if (declaration) statements.push(declaration);
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block");

        return new BlockStatement(statements);
    }

    private ifStatement() {
        this.consume(TokenType.LEFT_PARENTHESIS, "Expect '(' after if");
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PARENTHESIS, "Expect ')' after if condition");

        const thenBranch: Statement[] = [];
        if (this.check(TokenType.LEFT_BRACE)) {
            this.advance();
            while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
                const statement: Statement | null = this.declaration();
                if (statement) thenBranch.push(statement);
            }

            this.consume(TokenType.RIGHT_BRACE, "Expect '}' after conditional's body");
        } else {
            const statement: Statement | null = this.declaration();
            if (statement) thenBranch.push(statement);
        }

        const elseBranch: Statement[] = [];
        if (this.check(TokenType.ELSE)) {
            this.advance();
            if (this.check(TokenType.LEFT_BRACE)) {
                this.advance();
                while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
                    const statement: Statement | null = this.declaration();
                    if (statement) elseBranch.push(statement);
                }

                this.consume(
                    TokenType.RIGHT_BRACE,
                    "Expect '}' after conditional's body"
                );
            } else {
                const statement: Statement | null = this.declaration();
                if (statement) elseBranch.push(statement);
            }
        }

        return new IfStatement(condition, thenBranch, elseBranch);
    }

    private expressionStatement(): Statement {
        const expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new ExpressionStatement(expression);
    }

    private expression(): Expression {
        return this.assignment();
    }

    private assignment(): Expression {
        const expression = this.logicalDisjunction();

        if (this.match(TokenType.EQUAL)) {
            const equals = this.previous();
            const value = this.logicalDisjunction();

            if (expression instanceof VariableExpression) {
                return new AssignmentExpression(expression.name, value);
            }

            // Report a parse error, but don't throw it, as we don't
            // need to synchronize
            this.parseError(equals, `Invalid assignment target`);
        }

        return expression;
    }

    private logicalDisjunction() {
        let left: Expression = this.logicalConjunction();

        while (this.match(TokenType.LOGICAL_OR)) {
            const operator = this.previous();
            const right = this.logicalConjunction();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private logicalConjunction() {
        let left: Expression = this.equality();

        while (this.match(TokenType.LOGICAL_AND)) {
            const operator = this.previous();
            const right = this.equality();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private equality(): Expression {
        let left: Expression = this.comparison();

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
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
                TokenType.GREATER,
                TokenType.GREATER_EQUAL,
                TokenType.LESS,
                TokenType.LESS_EQUAL
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

        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.multiplication();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private multiplication(): Expression {
        let left: Expression = this.unary();

        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    private unary(): Expression {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new UnaryExpression(operator, right);
        }

        return this.primary();
    }

    private primary(): Expression {
        if (this.match(TokenType.FALSE)) return new LiteralExpression(false);
        if (this.match(TokenType.TRUE)) return new LiteralExpression(true);
        if (this.match(TokenType.NULL)) return new LiteralExpression(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new LiteralExpression(this.previous().literal);
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return new VariableExpression(this.previous());
        }

        if (this.match(TokenType.LEFT_PARENTHESIS)) {
            const expression = this.expression();
            this.consume(TokenType.RIGHT_PARENTHESIS, "Expect ')' after expression");
            return new GroupingExpression(expression);
        }

        throw this.parseError(this.peek(), 'Expect expression');
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();

        throw this.parseError(this.peek(), message);
    }

    private parseError(token: Token, message: string): ParseError {
        this.powerScript.parsingError(token, message);
        return new ParseError();
    }

    private synchronize(): void {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === TokenType.SEMICOLON) return;

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUNCTION:
                case TokenType.LET:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.RETURN:
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
        const currentTokenType = this.peek().type;
        const comparison = currentTokenType === type;
        return comparison;
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
