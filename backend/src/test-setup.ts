// Jest setup file to handle TypeORM and other global mocks

// Mock app-root-path to avoid "Cannot read properties of undefined (reading 'indexOf')" error
jest.mock('app-root-path', () => ({
  path: process.cwd(),
  resolve: (pathToResolve: string) => require('path').resolve(process.cwd(), pathToResolve),
  toString: () => process.cwd(),
}));

// Set NODE_ENV for tests
process.env.NODE_ENV = 'test';
