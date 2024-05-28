import * as fs from 'fs';

function main(args: string[]): void {
    if (args.length !== 1) {
        console.error('Usage: powerscript-generate-ast <output directory>');
        process.exit(1);
    }

    const outputDirectory = args[0];

    defineAST(outputDirectory, 'Expression', [
        'Binary   : Expression left, Token operator, Expression right',
        'Grouping : Expression expression',
        'Literal  : LiteralValue value',
        'Unary    : Token operator, Expression right'
    ]);
}

function defineAST(outputDirectory: string, baseName: string, types: string[]): void {
    const path = `${outputDirectory}/${baseName}.ts`;

    const lines = [
        '// This file is programmatically generated. Do not edit it directly.',
        '',
        "import Token from './../Token';",
        "import LiteralValue from './../LiteralValue';",
        '',
        `export abstract class ${baseName} {`,
        '    abstract accept<T>(visitor: Visitor<T>): T;',
        '}',
        '',
        ...defineVisitor(baseName, types),
        '',
        ...types.flatMap((type: string) => {
            const [className, fields] = type.split(':').map((s: string) => s.trim());
            return defineType(baseName, className, fields);
        })
    ];

    fs.writeFileSync(path, lines.join('\n'));
}
function defineType(baseName: string, className: string, fieldList: string) {
    const fields: string[][] = fieldList.split(', ').map((field) => field.split(' '));
    console.log(className, fields);
    return [
        `export class ${className} extends ${baseName} {`,

        // Fields
        ...fields.map(
            ([fieldType, fieldName]) =>
                `    private readonly _${fieldName}: ${fieldType};`
        ),
        '',

        // Constructor with all fields
        '    constructor(',
        ...fields.map(([fieldType, fieldName]) => `        ${fieldName}: ${fieldType},`),
        '    ) {',
        '        super();',
        ...fields.map(([_, fieldName]) => `        this._${fieldName} = ${fieldName}`),
        '    }',
        '',

        // Getters
        ...fields.map(
            ([fieldType, fieldName]) =>
                `    public get ${fieldName}(): ${fieldType} {\n        return this._${fieldName};\n    }\n`
        ),

        // Visitor pattern
        '    accept<T>(visitor: Visitor<T>): T {',
        `        return visitor.visit${className}${baseName}(this);`,
        '    }',

        '}',
        ''
    ];
}
function defineVisitor(baseName: string, types: string[]) {
    return [
        'export interface Visitor<T> {',
        ...types.map((type) => {
            const className = type.split(':')[0].trim();
            const method = `visit${className}${baseName}`;
            return `    ${method}(${baseName.toLowerCase()}: ${className}): T;`;
        }),
        '}'
    ];
}

main(process.argv.slice(2));
