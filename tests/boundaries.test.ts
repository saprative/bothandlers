import { test, expect } from 'vitest';
import { execSync } from 'child_process';

test('domain boundary violation is caught', () => {
  try {
    execSync('npx depcruise --config .dependency-cruiser.test.cjs backend/domain/tests/fixtures/domain-violation.ts', { stdio: 'ignore' });
    expect.unreachable('Should have failed');
  } catch (e) {
    expect(e.status).toBeGreaterThan(0);
  }
});

test('api boundary violation is caught', () => {
  try {
    execSync('npx depcruise --config .dependency-cruiser.test.cjs backend/api/tests/fixtures/api-violation.ts', { stdio: 'ignore' });
    expect.unreachable('Should have failed');
  } catch (e) {
    expect(e.status).toBeGreaterThan(0);
  }
});

test('sdk boundary violation is caught', () => {
  try {
    execSync('npx depcruise --config .dependency-cruiser.test.cjs sdk/typescript/tests/fixtures/sdk-violation.ts', { stdio: 'ignore' });
    expect.unreachable('Should have failed');
  } catch (e) {
    expect(e.status).toBeGreaterThan(0);
  }
});
