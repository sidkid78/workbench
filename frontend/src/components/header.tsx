'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Bot, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="flex items-center mr-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <span className="font-bold hidden sm:inline-block">AI Agent Workbench</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" asChild>
            <Link href="/agents">Agents</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/docs">Documentation</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center">
          <ModeToggle />
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4">
          <nav className="flex flex-col space-y-2">
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/agents">Agents</Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/docs">Documentation</Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="/settings">Settings</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}