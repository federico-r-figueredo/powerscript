import * as Expression from './Expression';

// Creates an unambiguous, if ugly, string representation of AST nodes
export default class ASTPrinter implements Expression.Visitor<string> {
    visitBinaryExpression(expression: Expression.Binary): string {
        return this.parenthesize(
            expression.operator.lexeme,
            expression.left,
            expression.right
        );
    }

    visitGroupingExpression(expression: Expression.Grouping): string {
        return this.parenthesize('group', expression.expression);
    }

    visitLiteralExpression(expression: Expression.Literal): string {
        if (expression.value === null) return 'null';
        return `${expression.value}`;
    }

    visitUnaryExpression(expression: Expression.Unary): string {
        return this.parenthesize(expression.operator.lexeme, expression.right);
    }

    private parenthesize(name: string, ...expressions: Expression.Expression[]): string {
        const expressionStrings = expressions.map((expression) =>
            expression.accept(this)
        );
        return `(${name} ${expressionStrings.join(' ')})`;
    }
}
