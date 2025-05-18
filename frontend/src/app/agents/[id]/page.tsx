'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgent, AgentConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, Edit, Play, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const data = await getAgent(agentId);
        setAgent(data);
      } catch (error) {
        toast.error('Failed to load agent');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const handleDeleteAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Agent deleted successfully');
        router.push('/agents');
      } else {
        throw new Error('Failed to delete agent');
      }
    } catch (error) {
      toast.error('Failed to delete agent');
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto py-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
        <p className="text-muted-foreground mb-6">The agent you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Button onClick={() => router.push('/agents')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" onClick={() => router.push('/agents')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">
            Last updated {formatDistanceToNow(new Date(agent.updated_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/agents/${agentId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={() => router.push(`/agents/${agentId}/playground`)}>
            <Play className="mr-2 h-4 w-4" />
            Run Agent
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Agent Overview</CardTitle>
              <CardDescription>Details about this agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Model</h3>
                <Badge variant="secondary">{agent.model}</Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap">
                  {agent.instructions}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Tools Summary</h3>
                <p>{agent.tools?.length || 0} tools configured</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {agent.tools?.map((tool, index) => (
                    <Badge key={index} variant="outline">
                      {tool.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push(`/agents/${agentId}/playground`)}>
                Test Agent in Playground
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Agent Tools</CardTitle>
              <CardDescription>
                Tools that extend the agent&apos;s capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!agent.tools || agent.tools.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tools configured for this agent.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => router.push(`/agents/${agentId}/edit`)}
                  >
                    Add a Tool
                  </Button>
                </div>
              ) : (
                agent.tools.map((tool, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{tool.type}</Badge>
                      <h3 className="font-semibold">{tool.name}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3">{tool.description}</p>
                    
                    {tool.type === 'function' && tool.function_code && (
                      <div className="bg-muted rounded-lg p-3 overflow-x-auto">
                        <pre className="text-sm">{tool.function_code}</pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
              <CardDescription>Technical details about this agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">AGENT ID</h3>
                <p className="font-mono">{agent.id}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">CREATED AT</h3>
                <p>{new Date(agent.created_at).toLocaleString()}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">LAST UPDATED</h3>
                <p>{new Date(agent.updated_at).toLocaleString()}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">MODEL</h3>
                <p>{agent.model}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">TOOL COUNT</h3>
                <p>{agent.tools?.length || 0} tools</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAgent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}