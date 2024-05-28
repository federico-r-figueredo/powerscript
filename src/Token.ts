import TokenType from './TokenType';

export default class Token {
    private readonly _type: TokenType;
    private readonly _lexeme: string;
    private readonly _literal: any;
    private readonly _line: number;

    constructor(type: TokenType, lexeme: string, literal: any, line: number) {
        this._type = type;
        this._lexeme = lexeme;
        this._literal = literal;
        this._line = line;
    }

    public get type(): TokenType {
        return this._type;
    }
    public get lexeme(): string {
        return this._lexeme;
    }
    public get literal(): any {
        return this._literal;
    }
    public get line(): number {
        return this._line;
    }

    toString(): string {
        return `type = ${this._type}, lexeme = ${this._lexeme},  literal =${this._literal}`;
    }
}
