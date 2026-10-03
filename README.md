# svelte-kit-sst

This adapter allows SvelteKit to deploy your SSR site to [AWS](https://aws.amazon.com/).

## Installation

Install the adapter to your project’s dependencies using your preferred package manager. If you’re using npm or aren’t sure, run this in the terminal:

```bash
  npm install svelte-kit-sst
```

### SvelteKit 3

SvelteKit 3 keeps its configuration in `vite.config.ts`. Add the adapter to the `sveltekit()` plugin.

```diff
+ import adapter from "svelte-kit-sst";
  import { sveltekit } from "@sveltejs/kit/vite";
  import { defineConfig } from "vite";

  export default defineConfig({
    plugins: [
      sveltekit({
+       adapter: adapter(),
      }),
    ],
  });
```

This version of the adapter requires `@sveltejs/kit` 3 and Node 22.17 or newer.

### SvelteKit 2

SvelteKit 2 and earlier read the adapter from `svelte.config.js`. Use `svelte-kit-sst@2`.

```diff
+ import adapter from "svelte-kit-sst";
  import { vitePreprocess } from "@sveltejs/kit/vite";

  const config = {
    preprocess: vitePreprocess(),
    kit: {
+     adapter: adapter(),
    },
  };

  export default config;
```

## Limitations

- `read` from `$app/server` isn't supported. The function only contains the server code and prerendered pages, and client assets are served from S3. A route that uses `read` fails the build with an error that says so.
- Server instrumentation (`instrumentation.server.js`) isn't supported yet.
