// src/app/page.tsx - Home page
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">AI Agent Workbench</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Create, configure, and run AI agents powered by Azure OpenAI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Build Agents</CardTitle>
            <CardDescription>
              Create custom AI agents with specific instructions and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Design agents for specific tasks by configuring their instructions, model, and tools.
              Easily create function tools to extend agent capabilities.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/agents/create">Create an Agent</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test in Playground</CardTitle>
            <CardDescription>
              Run agents and see them work in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Test your agents in an interactive playground. Watch them use tools, make decisions,
              and see detailed execution traces.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/agents">Browse Agents</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrate with Azure</CardTitle>
            <CardDescription>
              Powered by Azure OpenAI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Seamlessly connect to your Azure OpenAI deployments.
              Use your existing models and resources with the workbench.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings">Configure Settings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-muted rounded-lg p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-3 mb-6">
          <li>Configure your Azure OpenAI credentials in the Settings</li>
          <li>Create your first agent with instructions and tools</li>
          <li>Test your agent in the playground</li>
          <li>Refine and improve your agent based on its performance</li>
        </ol>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/agents">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}