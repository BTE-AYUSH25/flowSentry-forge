/**
 * Forge entrypoint for FlowSentry
 */

import Resolver from "@forge/resolver";

const resolver = new Resolver();

/**
 * ❌ Your earlier mistake:
 * Trying to render UI here
 *
 * ✅ Fix:
 * Resolver ONLY provides data / handshake
 * UI is rendered by index.html
 */
resolver.define("resolver", async () => {
  return {
    status: "ok",
    demoMode: true
  };
});

export const handler = resolver.getDefinitions();
