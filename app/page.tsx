import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome to TON Developer Tools</h1>
        <p className="mt-2 text-muted-foreground">A collection of useful tools for TON blockchain developers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Address Converter</CardTitle>
            <CardDescription>Convert TON addresses between different formats</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/web-tools/address-converter">Open Tool</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

