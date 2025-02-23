export interface DNSResolveResponse {
  wallet?: {
    address: string;
    account: {
      address: string;
      name: string;
      is_scam: boolean;
      is_wallet: boolean;
    };
    is_wallet: boolean;
    has_method_pubkey: boolean;
    has_method_seqno: boolean;
    names: string[];
  };
  sites: any[];
}

export async function resolveDNS(domain: string): Promise<string | null> {
  try {
    const response = await fetch(`https://tonapi.io/v2/dns/${domain}/resolve`, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: DNSResolveResponse = await response.json();
    return data.wallet?.address || null;
  } catch (error) {
    console.error('Error resolving DNS:', error);
    return null;
  }
} 