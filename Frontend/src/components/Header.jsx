import React from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Header({ appName = "AR Viewer", onLogout }) {
  return (
    <header className="w-full bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-xl font-bold text-slate-800">{appName}</Link>
        <div className="flex items-center space-x-2">
            <Link to="/profile">
                <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
        </div>
      </nav>
    </header>
  );
}