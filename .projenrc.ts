import { ReleasableCommits, typescript } from 'projen';
import { TypeScriptJsxMode } from 'projen/lib/javascript';
const project = new typescript.TypeScriptAppProject({
  name: 'aws-dora',
  description: 'Web application for exploring and testing AWS APIs',

  defaultReleaseBranch: 'main',
  projenrcTs: true,

  bin: {
    'aws-dora': 'tsx src/server.ts',
  },

  keywords: [
    'aws',
    'api',
    'explorer',
    'htmx',
    'nodejs',
    'typescript',
  ],

  authorName: 'Rico Hermans',
  authorEmail: 'rix0rrr@gmail.com',
  license: 'MIT',

  deps: [
    '@aws-sdk/credential-providers',
    '@aws-sdk/ec2-metadata-service',
    '@aws-sdk/shared-ini-file-loader',
    '@smithy/node-http-handler',
    'aws-sdk-js-v3-all',
    'express',
    'jsonc-parser',
    'proxy-agent',
    'react',
    'react-dom',
    'tsx',
  ],
  devDeps: [
    '@types/express',
    '@types/react',
    '@types/react-dom',
    'nodemon',
  ],
  tsconfig: {
    compilerOptions: {
      target: 'ES2022',
      jsx: TypeScriptJsxMode.REACT_JSX,
      lib: ['ES2022', 'DOM'],
    },
  },
  tsconfigDev: {
    include: ['build-tools/**/*.ts'],
  },

  githubOptions: {
    mergify: false,
  },

  release: true,
  releaseToNpm: true,
  releasableCommits: ReleasableCommits.featuresAndFixes(),
});

project.gitignore.addPatterns('.DS_Store');
project.addTask('parse-model', {
  description: 'Parse the AWS service model and generate data files',
  exec: 'tsx build-tools/parse-model.ts',
});
project.addTask('dev:watch', {
  description: 'Run the development server with live reload',
  exec: 'NODE_ENV=development nodemon --watch src --ext ts,tsx --exec tsx src/server.ts',
});

project.synth();