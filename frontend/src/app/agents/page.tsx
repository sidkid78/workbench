'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listAgents, deleteAgent, AgentConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Plus, Trash, ExternalLink, Edit, Play } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function AgentsDashboard() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await listAgents();
      setAgents(data);
    } catch (error) {
      toast.error('Failed to load agents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    
    try {
      await deleteAgent(agentToDelete);
      toast.success('Agent deleted successfully');
      setAgents(agents.filter(agent => agent.id !== agentToDelete));
    } catch (error) {
      toast.error('Failed to delete agent');
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setAgentToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <Button onClick={() => router.push('/agents/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-muted" />
              <CardContent className="h-24" />
              <CardFooter className="h-12 bg-muted" />
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-1">No agents yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first AI agent to get started
          </p>
          <Button onClick={() => router.push('/agents/create')}>
            Create Your First Agent
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Card key={agent.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Avatar className="h-10 w-10 mb-2">
                    <AvatarFallback>
                      <Bot className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/agents/${agent.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(agent.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{agent.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center">
                    <span className="mr-2">Model: {agent.model}</span>
                  </div>
                  <div>
                    Updated {formatDistanceToNow(new Date(agent.updated_at), { addSuffix: true })}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="line-clamp-3 text-muted-foreground">
                  {agent.instructions}
                </p>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground flex items-center">
                    <span>{agent.tools?.length || 0} tools</span>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/agents/${agent.id}`)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  onClick={() => router.push(`/agents/${agent.id}/playground`)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Run Agent
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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