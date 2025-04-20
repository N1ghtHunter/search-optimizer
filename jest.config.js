module.exports = {
	projects: [
		{
			displayName: 'node',
			testEnvironment: 'node',
			testMatch: ['<rootDir>/test/**/*.test.ts', '!<rootDir>/test/adapters/**/*.test.tsx'],
			preset: 'ts-jest',
			transform: {
				'^.+\\.tsx?$': 'ts-jest',
			},
			moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
		},
		{
			displayName: 'jsdom',
			testEnvironment: 'jsdom',
			testMatch: ['<rootDir>/test/adapters/**/*.test.tsx'],
			preset: 'ts-jest',
			transform: {
				'^.+\\.tsx?$': 'ts-jest',
			},
			moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
			setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
		},
	],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
	coverageReporters: ['text', 'lcov'],
	coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
};
