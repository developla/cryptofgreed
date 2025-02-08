export async function connectPhantom(): Promise<string | null> {
  try {
    const { solana } = window as any;

    if (!solana?.isPhantom) {
      throw new Error("Phantom wallet not found!");
    }

    // Request connection
    const resp = await solana.connect();
    const address = resp.publicKey.toString();

    // Add event listeners
    solana.on("accountChanged", () => {
      window.location.reload();
    });

    solana.on("disconnect", () => {
      window.location.reload();
    });

    return address;
  } catch (error) {
    console.error("Phantom connection error:", error);
    return null;
  }
}
