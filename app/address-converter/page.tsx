"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { validateTonAddress } from "@/lib/validate-address"
import { Address } from "@/lib/address"
import { resolveDNS } from "@/lib/dns-resolver"

export default function AddressConverter() {
  const [address, setAddress] = useState("")
  const [format, setFormat] = useState("user-friendly")
  const [copying, setCopying] = useState<{ [key: string]: boolean }>({})
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({
    isValid: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopying((prev) => ({ ...prev, [label]: true }))
      toast({
        description: "Address copied to clipboard",
      })

      // Reset the copying state after animation
      setTimeout(() => {
        setCopying((prev) => ({ ...prev, [label]: false }))
      }, 1000)
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy address",
      })
    }
  }

  const handleAddressChange = async (value: string) => {
    setAddress(value)
    setIsLoading(false)

    if (!value) {
      setValidation({ isValid: true })
      return
    }

    // Check if it's a DNS name
    if (value.endsWith('.ton') || value.endsWith('.t.me')) {
      setIsLoading(true)
      try {
        const resolvedAddress = await resolveDNS(value)
        if (resolvedAddress) {
          setAddress(resolvedAddress)
          setValidation({ isValid: true })
        } else {
          setValidation({ isValid: false, error: "Could not resolve DNS name" })
        }
      } catch (error) {
        setValidation({ isValid: false, error: "Failed to resolve DNS name" })
      }
      setIsLoading(false)
      return
    }

    // Regular address validation
    const result = validateTonAddress(value)
    setValidation({ isValid: result.isValid, error: result.error })
  }

  const getConvertedAddresses = (input: string) => {
    if (!input || !validation.isValid || isLoading) {
      return {
        hex: "",
        mainnetBounceable: "",
        mainnetNonBounceable: "",
        testnetBounceable: "",
        testnetNonBounceable: "",
      }
    }

    try {
      const address = new Address(input);
      
      return {
        hex: address.toString(false), // raw hex format
        mainnetBounceable: address.toString(true, true, true, false), // user-friendly, url-safe, bounceable, mainnet
        mainnetNonBounceable: address.toString(true, true, false, false), // user-friendly, url-safe, non-bounceable, mainnet
        testnetBounceable: address.toString(true, true, true, true), // user-friendly, url-safe, bounceable, testnet
        testnetNonBounceable: address.toString(true, true, false, true), // user-friendly, url-safe, non-bounceable, testnet
      }
    } catch (error) {
      console.error('Error converting address:', error);
      return {
        hex: "",
        mainnetBounceable: "",
        mainnetNonBounceable: "",
        testnetBounceable: "",
        testnetNonBounceable: "",
      }
    }
  }

  const convertedAddresses = getConvertedAddresses(address)

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button
      variant="outline"
      size="icon"
      onClick={() => handleCopy(text, label)}
      className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
      disabled={!text}
    >
      {copying[label] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  )

  const AddressInput = ({
    value,
    label,
    readOnly = false,
  }: {
    value: string
    label: string
    readOnly?: boolean
  }) => (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        readOnly={readOnly}
        className={`font-mono text-sm ${readOnly ? "" : validation.isValid ? "" : "border-red-500 focus-visible:ring-red-500"}`}
      />
      {readOnly && <CopyButton text={value} label={label} />}
    </div>
  )

  const NetworkHeader = ({ title, address, isTestnet }: { title: string; address: string; isTestnet: boolean }) => (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">{title}</h3>
      <div className="w-[140px]">
        <a
          href={`https://${isTestnet ? 'testnet.' : ''}tonviewer.com/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${!address ? 'pointer-events-none opacity-50' : ''} text-muted-foreground hover:text-foreground`}
        >
          View in Explorer
          <ExternalLink className="h-4 w-4 ml-2" />
        </a>
      </div>
    </div>
  )

  return (
    <div className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">TON Address Converter</h1>
        <p className="mt-2 text-muted-foreground">
          Convert TON addresses between different formats: hex, user-friendly (bounceable and non-bounceable), testnet, and DNS names (.ton and t.me)
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address" className="relative block">
              <span>Enter Address or DNS Name</span>
              {!validation.isValid && address && (
                <span className="absolute right-0 top-0 text-sm text-red-500">{validation.error}</span>
              )}
            </Label>
            <Input
              id="address"
              placeholder="Enter TON address or DNS name (e.g. example.ton, user.t.me)..."
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={`${!validation.isValid && address ? "border-red-500 focus-visible:ring-red-500" : ""} ${isLoading ? "opacity-50" : ""}`}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label>Raw Address (HEX)</Label>
              <AddressInput value={convertedAddresses.hex} label="hex" readOnly />
            </div>

            <div className="space-y-4">
              <NetworkHeader 
                title="Mainnet" 
                address={convertedAddresses.mainnetBounceable}
                isTestnet={false}
              />
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Bounceable</Label>
                  <AddressInput value={convertedAddresses.mainnetBounceable} label="mainnetBounceable" readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Non-bounceable</Label>
                  <AddressInput value={convertedAddresses.mainnetNonBounceable} label="mainnetNonBounceable" readOnly />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <NetworkHeader 
                title="Testnet" 
                address={convertedAddresses.testnetBounceable}
                isTestnet={true}
              />
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Bounceable</Label>
                  <AddressInput value={convertedAddresses.testnetBounceable} label="testnetBounceable" readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Non-bounceable</Label>
                  <AddressInput value={convertedAddresses.testnetNonBounceable} label="testnetNonBounceable" readOnly />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The calculations can be verified at <a href="https://ton.org/address/" target="_blank" rel="noopener noreferrer">ton.org/address</a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

