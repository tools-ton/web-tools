// Utility functions
export function crc16(data: Uint8Array): Uint8Array {
  const poly = 0x1021;
  let reg = 0;
  const message = new Uint8Array(data.length + 2);
  message.set(data);
  for (let byte of message) {
    let mask = 0x80;
    while (mask > 0) {
      reg <<= 1;
      if (byte & mask) {
        reg += 1;
      }
      mask >>= 1;
      if (reg > 0xffff) {
        reg &= 0xffff;
        reg ^= poly;
      }
    }
  }
  return new Uint8Array([reg >> 8, reg & 0xff]);
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function stringToBytes(str: string): Uint8Array {
  return new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
}

export function base64toString(b64: string): string {
  // Convert URL-safe characters back to regular base64
  const base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  let padded = base64;
  if (base64.length % 4 !== 0) {
    padded = base64.padEnd(base64.length + (4 - (base64.length % 4)), '=');
  }
  
  return atob(padded);
}

export function stringToBase64(str: string): string {
  return btoa(str);
}

const BOUNCEABLE_TAG = 0x11;
const NON_BOUNCEABLE_TAG = 0x51;
const TEST_FLAG = 0x80;

interface ParsedAddress {
  isTestOnly: boolean;
  workchain: number;
  hashPart: Uint8Array;
  isBounceable: boolean;
}

function parseFriendlyAddress(addressString: string): ParsedAddress {
  if (addressString.length !== 48) {
    throw new Error(`User-friendly address should contain strictly 48 characters`);
  }
  const data = stringToBytes(base64toString(addressString));
  if (data.length !== 36) {
    throw new Error("Unknown address type: byte length is not equal to 36");
  }
  
  const addr = data.slice(0, 34);
  const crc = data.slice(34, 36);
  const calcedCrc = crc16(addr);
  
  if (!(calcedCrc[0] === crc[0] && calcedCrc[1] === crc[1])) {
    throw new Error("Wrong crc16 hashsum");
  }
  
  let tag = addr[0];
  let isTestOnly = false;
  let isBounceable = false;
  
  if (tag & TEST_FLAG) {
    isTestOnly = true;
    tag = tag ^ TEST_FLAG;
  }
  
  if (tag !== BOUNCEABLE_TAG && tag !== NON_BOUNCEABLE_TAG) {
    throw new Error("Unknown address tag");
  }
  
  isBounceable = tag === BOUNCEABLE_TAG;
  
  let workchain = addr[1] === 0xff ? -1 : addr[1];
  if (workchain !== 0 && workchain !== -1) {
    throw new Error('Invalid address wc ' + workchain);
  }
  
  const hashPart = addr.slice(2, 34);
  return { isTestOnly, isBounceable, workchain, hashPart };
}

export class Address {
  wc: number;
  hashPart: Uint8Array;
  isTestOnly: boolean;
  isUserFriendly: boolean;
  isBounceable: boolean;
  isUrlSafe: boolean;

  static isValid(anyForm: string | Address): boolean {
    try {
      new Address(anyForm);
      return true;
    } catch (e) {
      return false;
    }
  }

  constructor(anyForm: string | Address) {
    if (anyForm == null) {
      throw new Error("Invalid address");
    }

    if (anyForm instanceof Address) {
      this.wc = anyForm.wc;
      this.hashPart = anyForm.hashPart;
      this.isTestOnly = anyForm.isTestOnly;
      this.isUserFriendly = anyForm.isUserFriendly;
      this.isBounceable = anyForm.isBounceable;
      this.isUrlSafe = anyForm.isUrlSafe;
      return;
    }

    this.isUrlSafe = true;
    let processedForm = anyForm;

    if (processedForm.search(/\-/) > 0 || processedForm.search(/_/) > 0) {
      processedForm = processedForm.replace(/\-/g, '+').replace(/_/g, '/');
    } else {
      this.isUrlSafe = false;
    }

    if (processedForm.indexOf(':') > -1) {
      const [wcStr, hex] = processedForm.split(':');
      if (!wcStr || !hex) throw new Error('Invalid address ' + anyForm);
      
      const wc = parseInt(wcStr);
      if (wc !== 0 && wc !== -1) throw new Error('Invalid address wc ' + anyForm);
      if (hex.length !== 64) throw new Error('Invalid address hex ' + anyForm);
      
      this.isUserFriendly = false;
      this.wc = wc;
      this.hashPart = hexToBytes(hex);
      this.isTestOnly = false;
      this.isBounceable = false;
    } else {
      this.isUserFriendly = true;
      const parseResult = parseFriendlyAddress(processedForm);
      this.wc = parseResult.workchain;
      this.hashPart = parseResult.hashPart;
      this.isTestOnly = parseResult.isTestOnly;
      this.isBounceable = parseResult.isBounceable;
    }
  }

  toString(
    isUserFriendly?: boolean,
    isUrlSafe?: boolean,
    isBounceable?: boolean,
    isTestOnly?: boolean
  ): string {
    isUserFriendly = isUserFriendly ?? this.isUserFriendly;
    isUrlSafe = isUrlSafe ?? this.isUrlSafe;
    isBounceable = isBounceable ?? this.isBounceable;
    isTestOnly = isTestOnly ?? this.isTestOnly;

    if (!isUserFriendly) {
      return this.wc + ":" + bytesToHex(this.hashPart);
    }

    let tag = isBounceable ? BOUNCEABLE_TAG : NON_BOUNCEABLE_TAG;
    if (isTestOnly) {
      tag |= TEST_FLAG;
    }

    const addr = new Uint8Array(34);
    addr[0] = tag;
    addr[1] = this.wc;
    addr.set(this.hashPart, 2);

    const addressWithChecksum = new Uint8Array(36);
    addressWithChecksum.set(addr);
    addressWithChecksum.set(crc16(addr), 34);

    let addressBase64 = stringToBase64(
      String.fromCharCode.apply(null, Array.from(addressWithChecksum))
    );

    if (isUrlSafe) {
      addressBase64 = addressBase64.replace(/\+/g, '-').replace(/\//g, '_');
    }
    
    return addressBase64;
  }
}
