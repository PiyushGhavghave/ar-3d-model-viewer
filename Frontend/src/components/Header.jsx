import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header({ appName = "AR Viewer", onLogout }) {
  return (
    <header className="w-full bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-slate-800">{appName}</h1>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
    </header>
  );
}