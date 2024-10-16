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

// Creates an unambiguous, if ugly, string representation of AST nodes
export default class ASTPrinter implements ExpressionVisitor<string> {
    print(expression: Expression): string {
        return expression.accept(this);
    }

    visitAssignmentExpression(expression: AssignmentExpression): string {
        return this.parenthesize('=', expression.name.lexeme, expression.value);
    }

    visitBinaryExpression(expression: BinaryExpression): string {
        return this.parenthesize(
            expression.operator.lexeme,
            expression.left,
            expression.right
        );
    }

    visitGroupingExpression(expression: GroupingExpression): string {
        return this.parenthesize('group', expression.expression);
    }

    visitLiteralExpression(expression: LiteralExpression): string {
        if (expression.value === null) return 'null';
        return `${expression.value}`;
    }

    visitUnaryExpression(expression: UnaryExpression): string {
        return this.parenthesize(expression.operator.lexeme, expression.right);
    }

    visitVariableExpression(expression: VariableExpression): string {
        return expression.name.lexeme;
    }

    private parenthesize(name: string, ...args: (Expression | string)[]): string {
        const argumentStrings = args.map((argument) =>
            argument instanceof Expression ? argument.accept(this) : argument
        );
        return `(${name} ${argumentStrings.join(' ')})`;
    }
}
