// This file is programmatically generated. Do not edit it directly.

import Expression from "./Expression";

export abstract class Statement {
    abstract accept<T>(visitor: StatementVisitor<T>): T;
}

export default Statement

export interface StatementVisitor<T> {
    visitExpressionStatement(statement: ExpressionStatement): T;
    visitPrintStatement(statement: PrintStatement): T;
}

export class ExpressionStatement extends Statement {
    private readonly _expression: Expression;

    constructor(
        expression: Expression,
    ) {
        super();
        this._expression = expression
    }

    public get expression(): Expression {
        return this._expression;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitExpressionStatement(this);
    }
}

export class PrintStatement extends Statement {
    private readonly _expression: Expression;

    constructor(
        expression: Expression,
    ) {
        super();
        this._expression = expression
    }

    public get expression(): Expression {
        return this._expression;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitPrintStatement(this);
    }
}
