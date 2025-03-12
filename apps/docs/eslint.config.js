import baseConfig, { restrictEnvAccess } from '@agentset/eslint-config/base';
import nextjsConfig from '@agentset/eslint-config/nextjs';
import reactConfig from '@agentset/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['.next/**'],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
