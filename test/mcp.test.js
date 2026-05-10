import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const mcpServerPath = resolve('src/mcp.js');

test('MCP server exposes a no tool', async () => {
  const client = new Client({
    name: 'naas-test-client',
    version: '0.0.0'
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [mcpServerPath],
    cwd: process.cwd(),
    stderr: 'pipe'
  });

  try {
    await client.connect(transport);

    const tools = await client.listTools();
    assert.deepEqual(
      tools.tools.map((tool) => tool.name),
      ['no']
    );

    const result = await client.callTool({
      name: 'no',
      arguments: {
        question: 'Can I?',
        payload: { any: 'thing' }
      }
    });

    assert.deepEqual(result.content, [{ type: 'text', text: 'No!' }]);
  } finally {
    await client.close();
  }
});
