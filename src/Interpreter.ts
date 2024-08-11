import {
    Expression,
    BinaryExpression,
    GroupingExpression,
    LiteralExpression,
    UnaryExpression,
    ExpressionVisitor
} from './Expression';
import LiteralValue from './LiteralValue';
import TokenType from './TokenType';
import Token from './Token';
import RuntimeError from './RuntimeError';

export default class Interpreter implements ExpressionVisitor<LiteralValue> {
    private readonly runtimeError: (error: RuntimeError) => void;

    constructor(runtimeError: (error: RuntimeError) => void) {
        this.runtimeError = runtimeError;
    }

    public interpret(expression: Expression) {
        try {
            const value = this.evaluate(expression);
            console.log(this.stringify(value));
        } catch (error) {
            if (error instanceof RuntimeError) {
                this.runtimeError(error);
            } else throw error;
        }
    }

    private evaluate(expression: Expression): LiteralValue {
        return expression.accept(this);
    }

    private stringify(object: LiteralValue): any {
        if (object === 'null') return null;
        return String(object);
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
            case TokenType.Bang:
                return !this.isTruthy(right);
            case TokenType.Minus:
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
            case TokenType.Plus:
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
            case TokenType.Minus:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) - (right as number);

            case TokenType.Slash:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) / (right as number);
            case TokenType.Star:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) * (right as number);
            case TokenType.Greater:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) > (right as number);
            case TokenType.GreaterEqual:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) >= (right as number);
            case TokenType.Less:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) < (right as number);
            case TokenType.LessEqual:
                this.checkNumberOperands(expression.operator, left, right);
                return (left as number) <= (right as number);
            case TokenType.EqualEqual:
                return this.isEqual(left, right);
            case TokenType.BangEqual:
                return !this.isEqual(left, right);
        }

        throw new Error(`Unexpected binary operation: ${expression.operator.lexeme}`);
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
}
