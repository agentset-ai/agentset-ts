import { Agentset } from "../src";

// Function to display a section header
const logSection = (title: string) => {
  console.log("\n" + "=".repeat(50));
  console.log(`  ${title}`);
  console.log("=".repeat(50) + "\n");
};

// Example usage of the Agentset SDK
async function main() {
  try {
    // Initialize the Agentset client
    const apiKey = process.env.AGENTSET_API_KEY;
    if (!apiKey) {
      throw new Error("AGENTSET_API_KEY environment variable is not set");
    }

    const agentset = new Agentset({ apiKey });

    // List existing namespaces
    logSection("Listing Namespaces");
    const namespaces = await agentset.namespaces.list();
    console.log(`Found ${namespaces.length} namespaces:`);
    namespaces.forEach((ns) => {
      console.log(`- ${ns.name} (${ns.slug})`);
    });

    // Create a new namespace
    logSection("Creating Namespace");
    const namespaceName = `Test Namespace ${Date.now()}`;
    const namespaceSlug = `test-namespace-${Date.now()}`;
    console.log(`Creating namespace: ${namespaceName} (${namespaceSlug})`);

    const namespace = await agentset.namespaces.create({
      name: namespaceName,
      slug: namespaceSlug,
    });

    console.log("Namespace created:");
    console.log(JSON.stringify(namespace, null, 2));

    // Get the namespace
    const ns = agentset.namespace(namespaceSlug);
    logSection("Namespace Details");
    const nsDetails = await ns.get();
    console.log(JSON.stringify(nsDetails, null, 2));

    // Ingest content
    logSection("Ingesting Content");
    const ingestJob = await ns.ingestion.create({
      name: "About Agentset",
      payload: {
        type: "TEXT",
        text: "Agentset is a RAG-as-a-service platform that provides AI-powered search and retrieval capabilities.",
      },
    });

    console.log("Ingestion job created:");
    console.log(JSON.stringify(ingestJob, null, 2));

    // List ingestion jobs
    logSection("Listing Ingestion Jobs");
    const { jobs } = await ns.ingestion.all();
    console.log(`Found ${jobs.length} ingestion jobs`);

    // Wait a bit for processing
    console.log("Waiting for ingestion to complete...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Search the namespace
    logSection("Searching");
    const searchResults = await ns.search("What is Agentset?");
    console.log("Search results:");
    console.log(JSON.stringify(searchResults, null, 2));

    // Clean up (optional)
    logSection("Cleaning Up");
    console.log(`Deleting namespace: ${namespaceSlug}`);
    await ns.delete();
    console.log("Namespace deleted");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
