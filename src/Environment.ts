import LiteralValue from './LiteralValue';
import RuntimeError from './RuntimeError';
import Token from './Token';

export default class Environment {
    private readonly enclosing: Environment | null;
    private readonly values = new Map<string, LiteralValue>();

    constructor(enclosing: Environment | null = null) {
        this.enclosing = enclosing;
    }

    get(name: Token): LiteralValue {
        let value = this.values.get(name.lexeme);

        if (value == undefined) {
            if (this.enclosing) {
                return this.enclosing.get(name);
            }

            throw new RuntimeError(name, `Undefined variable '${name.lexeme}'`);
        }

        return value;
    }

    assign(name: Token, value: LiteralValue): void {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
        } else if (this.enclosing) {
            this.enclosing.assign(name, value);
        } else {
            throw new RuntimeError(name, `Undefined variable '${name.lexeme}'`);
        }
    }

    define(name: string, value: LiteralValue): void {
        this.values.set(name, value);
    }
}
