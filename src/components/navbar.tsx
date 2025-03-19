"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PlusCircle, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="font-bold text-xl">Product Admin</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/upload"
                className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center px-3 py-2 rounded-md hover:bg-primary-foreground/10"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>

          <div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center font-black"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
