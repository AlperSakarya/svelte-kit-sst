import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Adapter, Builder } from "@sveltejs/kit";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default function (): Adapter {
  return {
    name: "svelte-kit-sst",
    async adapt(builder: Builder) {
      const out = path.join(".svelte-kit", "svelte-kit-sst");
      const clientDir = path.join(out, "client");
      const serverDir = path.join(out, "server");
      const prerenderedDir = path.join(out, "prerendered");

      // Cleanup output folder
      fs.rmSync(out, { force: true, recursive: true });
      fs.mkdirSync(clientDir, { recursive: true });
      fs.mkdirSync(prerenderedDir, { recursive: true });

      // Create static output
      builder.log.minor("Copying assets...");
      builder.writeClient(clientDir);
      const prerenderedFiles = builder.writePrerendered(prerenderedDir);

      // Create Lambda function
      builder.log.minor("Generating server function...");
      // SvelteKit 3 writes the server instance (`export const server`) next to
      // its own server output. Generate it there, then copy everything over.
      const kitServerDir = builder.getServerDirectory();
      builder.generateServerInstance(path.join(kitServerDir, "server.js"));
      builder.copy(kitServerDir, serverDir);
      // copy over handler files in server handler folder
      builder.copy(
        path.join(__dirname, "handler"),
        path.join(serverDir, "lambda-handler")
      );
      // save a list of files in server handler folder
      fs.writeFileSync(
        path.join(serverDir, "lambda-handler", "prerendered-file-list.js"),
        `export default ${JSON.stringify(prerenderedFiles)}`
      );
    },

    supports: {
      // The function only contains the server code and prerendered pages. The
      // client assets are served from S3, so `read` can't open them.
      read: ({ route }) => {
        throw new Error(
          `svelte-kit-sst doesn't support \`read\` from '$app/server' (used by ${route.id}). ` +
            "Client assets are served from S3 and aren't included in the Lambda function."
        );
      },
      // Wrapping the entrypoint for instrumentation isn't implemented yet.
      instrumentation: () => false,
    },
  };
}
