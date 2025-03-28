# Agentset

TypeScript SDK for [Agentset](https://agentset.ai), an agentic RAG-as-a-service.

[![npm version][npm-badge]][npm]
[![License][license-badge]][license]
[![Build Status][build-badge]][build]
[![Downloads][downloads-badge]][npm]
[![Size][size-badge]][npm]

## Installation

using npm:

```sh
npm install agentset
```

using yarn:

```sh
yarn add agentset
```

using pnpm:

```sh
pnpm add agentset
```

## Getting Started

```typescript
import { Agentset } from 'agentset';

// Initialize the client
const agentset = new Agentset({ 
  apiKey: 'your_api_key_here' 
});

// Create a namespace
const namespace = await agentset.namespaces.create({
  name: 'My Knowledge Base',
  // Optional: provide custom embedding model
  embeddingConfig: {
    provider: 'OPENAI',
    model: 'text-embedding-3-small',
    apiKey: 'your_openai_api_key_here'
  }
});

// Get a namespace by ID or slug
const ns = agentset.namespace('my-knowledge-base');

// Ingest content
await ns.ingestion.create({
  payload: {
    type: 'TEXT',
    text: 'This is some content to ingest into the knowledge base.',
    name: 'Introduction'
  }
});

// List all ingestion jobs
const { jobs, pagination } = await ns.ingestion.all();

// Get a specific ingestion job
const job = await ns.ingestion.get('job_id');

// List all documents
const { documents } = await ns.documents.all();

// Search the knowledge base
const results = await ns.search('What is Agentset?');

// Chat with the knowledge base
const chat = await ns.chat(
  'Tell me about Agentset',
  [{ role: 'user', content: 'What can I do with it?' }]
);
```

## API Reference

Visit the [full documentation](https://docs.agentset.ai) for more details.

### Custom Fetch Implementation

You can provide a custom fetch implementation:

```typescript
import { Agentset } from 'agentset';
import nodeFetch from 'node-fetch';

const agentset = new Agentset({
  apiKey: 'your_api_key_here',
  fetcher: nodeFetch
});
```

### Error Handling

The SDK provides typed errors that you can catch and handle:

```typescript
import { Agentset, NotFoundError, UnauthorizedError } from 'agentset';

try {
  const namespace = await agentset.namespaces.get('non-existent-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Namespace not found');
  } else if (error instanceof UnauthorizedError) {
    console.error('Invalid API key');
  } else {
    console.error('Unexpected error', error);
  }
}
```

<!-- Links -->

[docs]: https://docs.agentset.ai/
[build-badge]: https://github.com/agentset-ai/agentset/actions/workflows/release.yml/badge.svg
[build]: https://github.com/agentset-ai/agentset/actions/workflows/release.yml
[license-badge]: https://badgen.net/github/license/agentset-ai/agentset
[license]: https://github.com/agentset-ai/agentset/blob/main/LICENSE
[npm]: https://www.npmjs.com/package/agentset
[npm-badge]: https://badgen.net/npm/v/agentset
[downloads-badge]: https://img.shields.io/npm/dm/agentset.svg
[size-badge]: https://badgen.net/packagephobia/publish/agentset