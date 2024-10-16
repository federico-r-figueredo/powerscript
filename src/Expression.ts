// This file is programmatically generated. Do not edit it directly.

import Token from "./Token";
import LiteralValue from "./LiteralValue";

export abstract class Expression {
    abstract accept<T>(visitor: ExpressionVisitor<T>): T;
}

export default Expression

export interface ExpressionVisitor<T> {
    visitAssignmentExpression(expression: AssignmentExpression): T;
    visitBinaryExpression(expression: BinaryExpression): T;
    visitGroupingExpression(expression: GroupingExpression): T;
    visitLiteralExpression(expression: LiteralExpression): T;
    visitUnaryExpression(expression: UnaryExpression): T;
    visitVariableExpression(expression: VariableExpression): T;
}

export class AssignmentExpression extends Expression {
    private readonly _name: Token;
    private readonly _value: Expression;

    constructor(
        name: Token,
        value: Expression,
    ) {
        super();
        this._name = name
        this._value = value
    }

    public get name(): Token {
        return this._name;
    }

    public get value(): Expression {
        return this._value;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitAssignmentExpression(this);
    }
}

export class BinaryExpression extends Expression {
    private readonly _left: Expression;
    private readonly _operator: Token;
    private readonly _right: Expression;

    constructor(
        left: Expression,
        operator: Token,
        right: Expression,
    ) {
        super();
        this._left = left
        this._operator = operator
        this._right = right
    }

    public get left(): Expression {
        return this._left;
    }

    public get operator(): Token {
        return this._operator;
    }

    public get right(): Expression {
        return this._right;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitBinaryExpression(this);
    }
}

export class GroupingExpression extends Expression {
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

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitGroupingExpression(this);
    }
}

export class LiteralExpression extends Expression {
    private readonly _value: LiteralValue;

    constructor(
        value: LiteralValue,
    ) {
        super();
        this._value = value
    }

    public get value(): LiteralValue {
        return this._value;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitLiteralExpression(this);
    }
}

export class UnaryExpression extends Expression {
    private readonly _operator: Token;
    private readonly _right: Expression;

    constructor(
        operator: Token,
        right: Expression,
    ) {
        super();
        this._operator = operator
        this._right = right
    }

    public get operator(): Token {
        return this._operator;
    }

    public get right(): Expression {
        return this._right;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitUnaryExpression(this);
    }
}

export class VariableExpression extends Expression {
    private readonly _name: Token;

    constructor(
        name: Token,
    ) {
        super();
        this._name = name
    }

    public get name(): Token {
        return this._name;
    }

    accept<T>(visitor: ExpressionVisitor<T>): T {
        return visitor.visitVariableExpression(this);
    }
}
