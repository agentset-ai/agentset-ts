#!/usr/bin/env node
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Agentset } from "agentset";
import { Command } from "commander";
import { z } from "zod";

if (!process.env.AGENTSET_API_KEY) throw new Error("AGENTSET_API_KEY not set");
const API_KEY = process.env.AGENTSET_API_KEY;

// Get package version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageVersion = packageJson.version;

// Parse command line arguments
const program = new Command();
program
  .version(packageVersion, "-v, --version", "output the current version")
  .option(
    "-d, --description [description]",
    "override the default tool description",
  )
  .option(
    "--ns, --namespace [namespace]",
    "specify the Agentset namespace id to use",
  )
  .parse(process.argv);
const options = program.opts();

const namespace = (options.namespace || process.env.AGENTSET_NAMESPACE_ID) as
  | string
  | undefined;
if (!namespace)
  throw new Error("Either pass --namespace or set AGENTSET_NAMESPACE_ID");

console.error("Using namespace", namespace);

// Create an MCP server
const server = new McpServer({
  name: "Agentset MCP",
  version: "1.0.0",
});

// Default tool description
const defaultDescription = `Look up information in the Knowledge Base. Use this tool when you need to:
 - Find relevant documents or information on specific topics
 - Retrieve company policies, procedures, or guidelines
 - Access product specifications or technical documentation
 - Get contextual information to answer company-specific questions
 - Find historical data or information about projects`;

// Use the provided description if available, otherwise use the default
if (options.description) {
  console.error("Using overridden description");
}
const description = options.description || defaultDescription;

server.tool(
  "knowledge-base-retrieve",
  description,
  {
    query: z
      .string()
      .describe("The query to search for data in the Knowledge Base"),
    topK: z
      .number()
      .describe("The maximum number of results to return. Defaults to 10.")
      .min(1)
      .max(100)
      .optional()
      .default(10),
    rerank: z
      .boolean()
      .describe(
        "Whether to rerank the results based on relevance. Defaults to true.",
      )
      .optional()
      .default(true),
  },
  async ({ query, topK, rerank }) => {
    const agentset = new Agentset({ apiKey: API_KEY });
    const ns = agentset.namespace(namespace);
    const result = await ns.search(query, {
      topK,
      rerank,
    });

    const content = result.map((item) => ({
      type: "text" as const,
      text: item.text,
    }));

    return { content };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agentset MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
