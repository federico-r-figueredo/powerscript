import PowerScript from './PowerScript';

// TODO: Adapted AST generator for statements with correct import detection
function main(args: string[]): void {
    const powerScript = new PowerScript();

    if (args.length > 1) {
        console.error('Usage: pws [script]');
        process.exit(64);
    } else if (args.length === 1) {
        powerScript.runFile(args[0]);
    } else {
        powerScript.runPrompt();
    }
}

main(process.argv.slice(2));
