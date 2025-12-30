import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  base,
  baseSepolia,
  xLayer,
  xLayerTestnet as appkitXLayerTestnet,
} from "@reown/appkit/networks";
import { AppKitProvider } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren, useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { defineChain } from "viem";
import { getNetworkConfig } from "@x402x/extensions";

// Fix xLayerTestnet chainId: AppKit has incorrect chainId (195), correct is 1952
// Use x402x/core as source of truth for network configuration
const xLayerTestnetConfig = getNetworkConfig("x-layer-testnet");
const xLayerTestnet = defineChain({
  ...appkitXLayerTestnet,
  id: xLayerTestnetConfig.chainId, // Override with correct chainId: 1952
});

// Initialize AppKit + Wagmi adapter
const appKitProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
if (!appKitProjectId) {
  throw new Error(
    "Missing VITE_WALLETCONNECT_PROJECT_ID. Please set your WalletConnect project ID in .env file.\n" +
    "Get your project ID from https://cloud.reown.com/",
  );
}

const appNetworks = [base, baseSepolia, xLayer, xLayerTestnet] as unknown as [any, ...any[]];
const wagmiAdapter = new WagmiAdapter({
  networks: appNetworks,
  projectId: appKitProjectId,
});

// Type assertion since we've already checked it exists
const projectId: string = appKitProjectId;

const queryClient = new QueryClient();

export function Web3Provider({ children }: PropsWithChildren) {
  const qc = useMemo(() => queryClient, []);
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <AppKitProvider
        projectId={projectId}
        adapters={[wagmiAdapter] as any}
        networks={appNetworks as any}
        defaultNetwork={base as any}
        metadata={{
          name: "x402.gives",
          description: "x402.gives — Open-source donation platform",
          url: typeof window !== "undefined" ? window.location.origin : "https://x402.gives",
          icons: ["https://avatars.githubusercontent.com/u/13698671?s=200&v=4"],
        }}
      >
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </AppKitProvider>
    </WagmiProvider>
  );
}
