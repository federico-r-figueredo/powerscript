enum TokenType {
    // Single character tokens.
    LEFT_PARENTHESIS = 'LEFT_PARENTHESIS',
    RIGHT_PARENTHESIS = 'LEFT_PARENTHESIS',
    LEFT_BRACE = 'LEFT_BRACE',
    RIGHT_BRACE = 'RIGHT_BRACE',
    COMMA = 'COMMA',
    DOT = 'DOT',
    MINUS = 'MINUS',
    PLUS = 'PLUS',
    SEMICOLON = 'SEMICOLON',
    SLASH = 'SLASH',
    STAR = 'STAR',
    BITWISE_AND = 'BITWISE_AND',
    BITWISE_OR = 'BITWISE_OR',

    // One or two character tokens.
    BANG = 'BANG',
    BANG_EQUAL = 'BANG_EQUAL',
    EQUAL = 'EQUAL',
    EQUAL_EQUAL = 'EQUAL_EQUAL',
    GREATER = 'GREATER',
    GREATER_EQUAL = 'GREATER_EQUAL',
    LESS = 'LESS',
    LESS_EQUAL = 'LESS_EQUAL',

    // Literals
    IDENTIFIER = 'IDENTIFIER',
    STRING = 'STRING',
    NUMBER = 'NUMBER',

    // Keywords
    LOGICAL_AND = 'AND',
    CLASS = 'CLASS',
    CONST = 'CONST',
    ELSE = 'ELSE',
    FALSE = 'FALSE',
    FUNCTION = 'FUNCTION',
    FOR = 'FOR',
    IF = 'IF',
    NULL = 'NULL',
    LOGICAL_OR = 'OR',
    PRINT = 'PRINT',
    RETURN = 'RETURN',
    SUPER = 'SUPER',
    THIS = 'THIS',
    TRUE = 'TRUE',
    LET = 'LET',
    WHILE = 'WHILE',

    // End of file.
    EOF = 'EOF'
}

export default TokenType;
