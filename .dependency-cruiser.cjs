/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-strict-dependencies',
      comment: 'The domain layer cannot import cloud provider SDKs, HTTP frameworks, serverless runtime types, emulator libraries, or agent frameworks.',
      severity: 'error',
      from: { path: '^backend/domain' },
      to: {
        path: '(@aws-sdk|hono|aws-lambda|langchain|@google/genai|openai|floci)'
      }
    },
    {
      name: 'sdk-backend-isolation',
      comment: 'The SDK cannot import backend implementation code.',
      severity: 'error',
      from: { path: '(^|/)sdk/' },
      to: {
        path: '(^|/)backend/'
      }
    },
    {
      name: 'transport-layer-isolation',
      comment: 'Transports can only call application services, not domain directly.',
      severity: 'error',
      from: { path: '(^|/)backend/(api|mcp|workers)' },
      to: {
        pathNot: '(^|/)backend/application|(^|/)packages/(contracts|utilities)|node_modules'
      }
    },
    {
      name: 'config-no-logic',
      comment: 'The config package declares shapes only and must not import logic or external SDKs.',
      severity: 'error',
      from: { path: '(^|/)packages/config' },
      to: {
        path: '(@aws-sdk|hono|aws-lambda|langchain|@google/genai|openai|floci|(^|/)backend/)'
      }
    }
  ],
  options: {
    exclude: {
      path: '(^|/)tests/fixtures/'
    },
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json'
    }
  }
};
