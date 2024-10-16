import * as fs from 'fs';

interface ClassDefinition {
    baseName: string;
    className: string;
    fields: {
        type: string;
        name: string;
    }[];
}

function main(args: string[]): void {
    if (args.length !== 1) {
        console.error('Usage: powerscript-generate-ast <output directory>');
        process.exit(1);
    }

    const outputDirectory = args[0];

    defineAST(outputDirectory, 'Expression', [
        'Assignment : Token name, Expression value',
        'Binary     : Expression left, Token operator, Expression right',
        'Grouping   : Expression expression',
        'Literal    : LiteralValue value',
        'Unary      : Token operator, Expression right',
        'Variable   : Token name'
    ]);

    defineAST(outputDirectory, 'Statement', [
        'Expression : Expression expression',
        'Print      : Expression expression',
        'Variable   : Token name, Expression initializer',
        'Block      : Statement[] statements'
    ]);
}

function defineAST(outputDirectory: string, baseName: string, types: string[]): void {
    const path = `${outputDirectory}/${baseName}.ts`;

    const classDefinitions = types.map((type) => parseClassDefinition(baseName, type));

    const importedTypes = new Set(
        classDefinitions
            .flatMap(({ fields }) => fields)
            .map(({ type }) => type)
            .filter((type) => type !== baseName)
    );

    const lines = [
        '// This file is programmatically generated. Do not edit it directly.',
        '',
        ...Array.from(importedTypes).map((type) => `import ${type} from "./${type}";`),
        '',
        `export abstract class ${baseName} {`,
        `    abstract accept<T>(visitor: ${baseName}Visitor<T>): T;`,
        '}',
        '',
        `export default ${baseName}`,
        '',
        ...defineVisitor(baseName, classDefinitions),
        '',
        ...classDefinitions.flatMap(defineType)
    ];

    fs.writeFileSync(path, lines.join('\n'));
}

function defineType({ baseName, className, fields }: ClassDefinition) {
    console.log(className, fields);

    return [
        `export class ${className} extends ${baseName} {`,

        // Fields
        ...fields.map(({ type, name }) => `    private readonly _${name}: ${type};`),
        '',

        // Constructor with all fields
        '    constructor(',
        ...fields.map(({ type, name }) => `        ${name}: ${type},`),
        '    ) {',
        '        super();',
        ...fields.map(({ name }) => `        this._${name} = ${name}`),
        '    }',
        '',

        // Getters
        ...fields.map(
            ({ type, name }) =>
                `    public get ${name}(): ${type} {\n        return this._${name};\n    }\n`
        ),

        // Visitor pattern
        `    accept<T>(visitor: ${baseName}Visitor<T>): T {`,
        `        return visitor.visit${className}(this);`,
        '    }',

        '}',
        ''
    ];
}
function defineVisitor(baseName: string, classDefinitions: ClassDefinition[]) {
    return [
        `export interface ${baseName}Visitor<T> {`,
        ...classDefinitions.map(({ className }) => {
            const method = `visit${className}`;
            return `    ${method}(${baseName.toLowerCase()}: ${className}): T;`;
        }),
        '}'
    ];
}

function parseClassDefinition(baseName: string, definition: string): ClassDefinition {
    const [classPrefix, fieldList] = definition.split(':').map((x) => x.trim());
    const className = classPrefix + baseName;
    const fields = fieldList.split(', ').map((field) => {
        const [type, name] = field.split(' ');
        return { type, name };
    });

    return { baseName, className, fields };
}

main(process.argv.slice(2));
