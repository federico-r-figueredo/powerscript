/* eslint-env jest */

/**
 * This script creates a jest test for every PowerScript file in the
 * tests directory which runs the code and then compares the printed
 * output to the sections labelled -- OUTPUT -- and -- ERROR --
 */

import * as fileSystem from 'fs';
import PowerScript from './PowerScript';

// This class overrides the print functions to allow capturing
// STDERR and STDOUT for tests
class TestPowerScript extends PowerScript {
    private _standardOut: string = '';
    private _standardError: string = '';

    public get standardOut(): string {
        return this._standardOut;
    }

    public get standardError(): string {
        return this._standardError;
    }

    public print(message: string): void {
        this._standardOut += message + '\n';
    }

    public printError(message: string): void {
        this._standardError += message + '\n';
    }
}

const directoryPath = `${__dirname}/../tests/`;
const directoryEntries = fileSystem.readdirSync(directoryPath, {
    withFileTypes: true
});

for (const directoryEntry of directoryEntries) {
    if (directoryEntry.isFile() && directoryEntry.name.endsWith('.ps')) {
        test(directoryEntry.name, () => {
            const filePath = `${directoryPath}/${directoryEntry.name}`;
            let fileContent = fileSystem
                .readFileSync(filePath, { encoding: 'utf8' })
                .replace(/(\r?\n|\r)/gm, '\n');

            const spec = {
                source: '',
                standardOut: '',
                standardError: ''
            };
            let target: keyof typeof spec = 'source';

            for (const line of fileContent.split('\n')) {
                if (line.startsWith('-- OUTPUT --')) target = 'standardOut';
                else if (line.startsWith('-- ERROR --')) target = 'standardError';
                else if (target == 'standardError') {
                    spec[target] += '\x1b[31m\x1b[0m' + line;
                } else {
                    spec[target] += (spec[target] ? '\n' : '') + line;
                }
            }

            spec[target] += '\n';

            const powerScript = new TestPowerScript();

            powerScript.run(spec.source);

            expect(powerScript.standardOut).toBe(spec.standardOut);
            expect(powerScript.standardError).toBe(spec.standardError);
        });
    }
}
