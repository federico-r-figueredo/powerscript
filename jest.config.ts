import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    verbose: true,
    roots: ['build/', 'tests/']
};

export default config;
