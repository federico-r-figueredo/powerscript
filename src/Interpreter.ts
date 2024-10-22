import LiteralValue from './LiteralValue';
import TokenType from './TokenType';
import Token from './Token';
import RuntimeError from './RuntimeError';
import PowerScript from './PowerScript';
import {
    Expression,
    BinaryExpression,
    GroupingExpression,
    LiteralExpression,
    UnaryExpression,
    ExpressionVisitor,
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
import Environment from './Environment';

export default class Interpreter
    implements ExpressionVisitor<LiteralValue>, StatementVisitor<void>
{
    private readonly powerScript: PowerScript;
    private environment: Environment = new Environment();

    constructor(powerScript: PowerScript) {
        this.powerScript = powerScript;
    }

    interpret(statements: Statement[]) {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (error) {
            if (error instanceof RuntimeError) {
                this.powerScript.runtimeError(error);
            } else throw error;
        }
    }

    execute(statement: Statement) {
        statement.accept(this);
    }

    evaluate(expression: Expression): LiteralValue {
        return expression.accept(this);
    }

    visitAssignmentExpression(expression: AssignmentExpression): LiteralValue {
        const value = this.evaluate(expression.value);
        this.environment.assign(expression.name, value);
        return value;
    }

    visitLiteralExpression(expression: LiteralExpression): LiteralValue {
        return expression.value;
    }

    visitGroupingExpression(expression: GroupingExpression): LiteralValue {
        return this.evaluate(expression.expression);
    }

    visitUnaryExpression(expression: UnaryExpression): LiteralValue {
        const right = this.evaluate(expression.right);

        // TODO: Add specific UnaryOperator type to detect totality
        switch (expression.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(expression.operator, right);
                return -(right as number);
        }

        // Unreachable
        throw new Error(`Unexpected unary operator: ${expression.operator.lexeme}`);
    }

    visitBinaryExpression(expression: BinaryExpression): LiteralValue {
        const left = this.evaluate(expression.left);
        const right = this.evaluate(expression.right);

        switch (expression.operator.type) {
            case TokenType.PLUS:
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }

                if (typeof left === 'string' && typeof right === 'string') {
                    return left + right;
                }

                throw new RuntimeError(
                    expression.operator,
                    'Operands must be two numbers or two strings'
                );

                break;
            case TokenType.MINUS:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) - (right as number);
            case TokenType.SLASH:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) / (right as number);
            case TokenType.STAR:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) * (right as number);
            case TokenType.GREATER:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) > (right as number);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) >= (right as number);
            case TokenType.LESS:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) < (right as number);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) <= (right as number);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
        }

        throw new Error(`Unexpected binary operation: ${expression.operator.lexeme}`);
    }

    visitVariableExpression(expression: VariableExpression): LiteralValue {
        return this.environment.get(expression.name);
    }

    visitBlockStatement(statement: BlockStatement): void {
        const outerEnvironment = this.environment;

        try {
            this.environment = new Environment(outerEnvironment);

            for (const nestedStatement of statement.statements) {
                this.execute(nestedStatement);
            }
        } finally {
            this.environment = outerEnvironment;
        }
    }

    visitExpressionStatement(statement: ExpressionStatement): void {
        this.evaluate(statement.expression);
    }

    visitIfStatement(statement: IfStatement): void {
        if (this.isTruthy(this.evaluate(statement.condition))) {
            for (const thenBranchStatement of statement.thenBranch) {
                this.execute(thenBranchStatement);
            }
        } else if (statement.elseBranch.length > 0) {
            for (const elseBranchStatement of statement.elseBranch) {
                this.execute(elseBranchStatement);
            }
        }
    }

    visitPrintStatement(statement: PrintStatement): void {
        const value = this.evaluate(statement.expression);
        this.powerScript.print(this.stringify(value));
    }

    visitVariableStatement(statement: VariableStatement): void {
        const value = statement.initializer ? this.evaluate(statement.initializer) : null;
        this.environment.define(statement.name.lexeme, value);
    }

    private isEqual(left: LiteralValue, right: LiteralValue): boolean {
        return left === right;
    }

    private isTruthy(object: string | number | boolean | null) {
        return object !== null && object !== false;
    }

    private checkNumberOperand(operator: Token, operand: LiteralValue): void {
        if (typeof operand === 'number') return;
        throw new RuntimeError(operator, 'Operator must be a number');
    }

    private checkNumberOperands(
        operator: Token,
        left: LiteralValue,
        right: LiteralValue
    ): void {
        if (typeof left === 'number' && typeof right === 'number') return;
        throw new RuntimeError(operator, 'Operator must be a number');
    }

    private stringify(object: LiteralValue): any {
        if (object === 'null') return null;
        return String(object);
    }
}
