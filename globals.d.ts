// globals.d.ts
export {};

declare global {
  interface Window {
    helioCheckout: (
      container: HTMLElement | null,
      options: {
        paylinkId: string;
        theme: { themeMode: string };
        amount: string;
        network: string;
      }
    ) => void;
  }
}
