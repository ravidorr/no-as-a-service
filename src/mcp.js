#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import packageJson from '../package.json' with { type: 'json' };
import { NO_RESPONSE } from './no.js';

export function createMcpServer() {
  const server = new McpServer({
    name: 'naas',
    version: packageJson.version
  });

  server.registerTool(
    'no',
    {
      title: 'No',
      description: 'Return No! for any request.',
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => ({
      content: [
        {
          type: 'text',
          text: NO_RESPONSE
        }
      ]
    })
  );

  return server;
}

export async function runMcpServer() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runMcpServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
