// This file is programmatically generated. Do not edit it directly.

import Expression from "./Expression";
import Token from "./Token";

export abstract class Statement {
    abstract accept<T>(visitor: StatementVisitor<T>): T;
}

export default Statement

export interface StatementVisitor<T> {
    visitExpressionStatement(statement: ExpressionStatement): T;
    visitPrintStatement(statement: PrintStatement): T;
    visitVariableStatement(statement: VariableStatement): T;
    visitBlockStatement(statement: BlockStatement): T;
    visitIfStatement(statement: IfStatement): T;
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

export class VariableStatement extends Statement {
    private readonly _name: Token;
    private readonly _initializer: Expression;

    constructor(
        name: Token,
        initializer: Expression,
    ) {
        super();
        this._name = name
        this._initializer = initializer
    }

    public get name(): Token {
        return this._name;
    }

    public get initializer(): Expression {
        return this._initializer;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitVariableStatement(this);
    }
}

export class BlockStatement extends Statement {
    private readonly _statements: Statement[];

    constructor(
        statements: Statement[],
    ) {
        super();
        this._statements = statements
    }

    public get statements(): Statement[] {
        return this._statements;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitBlockStatement(this);
    }
}

export class IfStatement extends Statement {
    private readonly _condition: Expression;
    private readonly _thenBranch: Statement[];
    private readonly _elseBranch: Statement[];

    constructor(
        condition: Expression,
        thenBranch: Statement[],
        elseBranch: Statement[],
    ) {
        super();
        this._condition = condition
        this._thenBranch = thenBranch
        this._elseBranch = elseBranch
    }

    public get condition(): Expression {
        return this._condition;
    }

    public get thenBranch(): Statement[] {
        return this._thenBranch;
    }

    public get elseBranch(): Statement[] {
        return this._elseBranch;
    }

    accept<T>(visitor: StatementVisitor<T>): T {
        return visitor.visitIfStatement(this);
    }
}
