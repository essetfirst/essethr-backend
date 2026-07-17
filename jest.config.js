/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  maxWorkers: 1,
  testTimeout: 30000,
  testPathIgnorePatterns: ["/node_modules/"],
  projects: [
    {
      displayName: "unit",
      testMatch: [
        "<rootDir>/src/lib/**/*.test.js",
        "<rootDir>/src/middlewares/**/*.test.js",
        "<rootDir>/src/features/rbac/**/*.test.js",
        "<rootDir>/src/features/**/*.service.test.js",
      ],
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/src/features/**/*.test.js"],
      testPathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/src/features/rbac/",
      ],
      globalSetup: "<rootDir>/src/test/globalSetup.js",
      globalTeardown: "<rootDir>/src/test/globalTeardown.js",
      setupFilesAfterEnv: ["<rootDir>/src/test/integrationSetup.js"],
    },
  ],
};
