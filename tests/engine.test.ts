import Scanner from '../src/Lexer';
import Token from '../src/Token';
import TokenType from '../src/TokenType';

describe('Lexer class', () => {
    describe('scanTokens method', () => {
        it('should scan "(" token', () => {
            // Arrange
            const sut: Scanner = new Scanner('(', () => {});

            // Act
            const result: Token[] = sut.scanTokens();

            // Assert
            expect(result.length).toBe(2);

            const [firstToken, secondToken] = result;

            expect(firstToken).toBeInstanceOf(Token);
            expect(firstToken.type).toBe(TokenType.LeftParenthesis);
            expect(firstToken.lexeme).toBe('(');
            expect(firstToken.line).toBe(1);
            expect(firstToken.literal).toBe(null);

            expect(secondToken).toBeInstanceOf(Token);
            expect(secondToken.type).toBe(TokenType.EOF);
            expect(secondToken.lexeme).toBe('');
            expect(secondToken.line).toBe(1);
            expect(secondToken.literal).toBe(null);
        });
    });
});
