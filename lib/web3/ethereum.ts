export async function connectMetaMask(): Promise<string | null> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not found");
    }

    // Request accounts access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    // Add event listeners for account and chain changes
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    window.ethereum.on("disconnect", () => {
      window.location.reload();
    });

    return accounts[0];
  } catch (error) {
    console.error("MetaMask connection error:", error);
    return null;
  }
}
