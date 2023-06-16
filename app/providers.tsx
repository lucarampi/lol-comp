"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { MultiSelectTheme } from "chakra-multiselect";
const theme = extendTheme({
  components: {
    MultiSelect: MultiSelectTheme,
  },
});
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider toastOptions={{ defaultOptions: { position: 'top' } }} theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
