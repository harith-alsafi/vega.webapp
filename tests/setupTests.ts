// setupTests.ts           
import * as dotenv from 'dotenv';
// import '@testing-library/jest-dom/extend-expect'; // Import Jest DOM matchers

// Run setup code before running tests
beforeAll(() => {
  // Set up any global configurations or utilities here
  dotenv.config();
});

// Run cleanup code after running tests
afterAll(() => {
  // Clean up any resources or state here
});
