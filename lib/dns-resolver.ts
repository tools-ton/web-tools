export interface DNSResolveResponse {
  success: boolean;
  final_result: string;
  category?: string | null;
  collection_address?: string | null;
  nft_address?: string | null;
  detail?: string | null;
}

export async function resolveDNS(domain: string): Promise<string | null> {
  try {
    const response = await fetch(`https://dns.aiexz.top/api/resolve/${domain}`, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: DNSResolveResponse = await response.json();
    return data.success ? data.final_result : null;
  } catch (error) {
    console.error('Error resolving DNS:', error);
    return null;
  }
} 