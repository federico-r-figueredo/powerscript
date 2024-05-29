import {
    Expression,
    BinaryExpression,
    GroupingExpression,
    LiteralExpression,
    UnaryExpression,
    ExpressionVisitor
} from './Expression';

// Creates an unambiguous, if ugly, string representation of AST nodes
export default class ASTPrinter implements ExpressionVisitor<string> {
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

    private parenthesize(name: string, ...expressions: Expression[]): string {
        const expressionStrings = expressions.map((expression) =>
            expression.accept(this)
        );
        return `(${name} ${expressionStrings.join(' ')})`;
    }
}
