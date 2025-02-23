type AddressFormat = "hex" | "base64" | "unknown"

export function validateTonAddress(address: string): { isValid: boolean; format: AddressFormat; error?: string } {
  if (!address) {
    return { isValid: false, format: "unknown", error: "Address is required" }
  }

  // Validate HEX format
  if (address.includes(":")) {
    const [workchain, hex] = address.split(":")

    // Check workchain
    if (!/^-?\d+$/.test(workchain)) {
      return { isValid: false, format: "hex", error: "Invalid workchain ID" }
    }

    // Check hex part
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      return { isValid: false, format: "hex", error: "Invalid hex address (must be 64 characters)" }
    }

    return { isValid: true, format: "hex" }
  }

  // Check if it starts with valid prefix
  const validPrefixes = ["EQ", "UQ", "kQ", "0Q"]
  const hasValidPrefix = validPrefixes.some((prefix) => address.startsWith(prefix))

  if (!hasValidPrefix) {
    return {
      isValid: false,
      format: "base64",
      error: "Address must start with EQ, UQ (mainnet) or kQ, 0Q (testnet)",
    }
  }


  // Check length (should be 48 characters including prefix)
  if (address.length !== 48) {
    return {
      isValid: false,
      format: "base64",
      error: "Address must be 48 characters long",
    }
  }

  return { isValid: true, format: "base64" }
}

