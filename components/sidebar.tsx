import Link from "next/link"
import { FileText, Home } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar() {
  return (
    <Sidebar className="flex flex-col w-full border-b md:w-auto md:border-b-0 md:border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center p-4">
          <h2 className="text-lg font-semibold">TON Tools</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <SidebarGroup className="md:flex-none">
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <Home className="mr-2" />
                        <span>Home</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="md:flex-none">
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/address-converter">
                        <FileText className="mr-2" />
                        <span>Address Converter</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          
          <div className="mt-auto p-4 border-t">
            <ThemeToggle />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

