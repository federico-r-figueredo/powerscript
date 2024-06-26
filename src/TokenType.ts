enum TokenType {
    // Single character tokens.
    LeftParenthesis = 'LEFT_PAREN',
    RightParenthesis = 'RIGHT_PAREN',
    LeftBrace = 'LEFT_BRACE',
    RightBrace = 'RIGHT_BRACE',
    Comma = 'COMMA',
    Dot = 'DOT',
    Minus = 'MINUS',
    Plus = 'PLUS',
    Semicolon = 'SEMICOLON',
    Slash = 'SLASH',
    Star = 'STAR',

    // One or two character tokens.
    Bang = 'BANG',
    BangEqual = 'BANG_EQUAL',
    Equal = 'EQUAL',
    EqualEqual = 'EQUAL_EQUAL',
    Greater = 'GREATER',
    GreaterEqual = 'GREATER_EQUAL',
    Less = 'LESS',
    LessEqual = 'LESS_EQUAL',

    // Literals
    Identifier = 'IDENTIFIER',
    String = 'STRING',
    Number = 'NUMBER',

    // Keywords
    And = 'AND',
    Class = 'CLASS',
    Else = 'ELSE',
    False = 'FALSE',
    Function = 'FUNCTION',
    For = 'FOR',
    If = 'IF',
    Null = 'NULL',
    Or = 'OR',
    Return = 'RETURN',
    Super = 'SUPER',
    This = 'THIS',
    True = 'TRUE',
    Let = 'LET',
    While = 'WHILE',

    // End of file.
    EOF = 'EOF'
}

export default TokenType;
