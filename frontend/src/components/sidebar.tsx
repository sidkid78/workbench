'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Bot, 
  Brain, 
  Code, 
  Database, 
  Download,
  FileText, 
  History, 
  Home, 
  Plus, 
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const routes = [
    {
      name: 'Home',
      href: '/',
      icon: Home
    },
    {
      name: 'Agents',
      href: '/agents',
      icon: Bot
    },
    {
      name: 'Create Agent',
      href: '/agents/create',
      icon: Plus
    },
    {
      name: 'Conversations',
      href: '/conversations',
      icon: History
    },
    {
      name: 'Documentation',
      href: '/docs',
      icon: FileText
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-background h-[calc(100vh-3.5rem)]">
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={isActive(route.href) ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive(route.href) ? 'bg-accent' : ''
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Resources</h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/examples">
                  <Code className="mr-2 h-4 w-4" />
                  Example Agents
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/templates">
                  <Database className="mr-2 h-4 w-4" />
                  Tool Templates
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/tutorials">
                  <Brain className="mr-2 h-4 w-4" />
                  Tutorials
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="https://platform.openai.com/docs/agents" target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  OpenAI Docs
                </a>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>AI Agent Workbench</p>
            <p className="text-xs">v0.1.0</p>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}