'use client';

import { useState, useEffect, useRef, HTMLAttributes, ClassAttributes } from 'react';
import { useRouter } from 'next/navigation';
import { getAgent, MessageItem, createAgentStream } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bot, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

// Markdown rendering
// You'll need to install react-markdown with: npm install react-markdown
import ReactMarkdown from 'react-markdown';

interface Agent {
  id: string;
  name: string;
  model: string;
  instructions: string;
  tools?: Tool[];
}

interface Tool {
  type: string;
  name: string;
  description: string;
  function_code?: string;
}

interface ExecutionStepItem {
  type: string;
  name?: string;
  args?: Record<string, unknown>; // Consider defining a more specific type for args
  output?: Record<string, unknown>; // Consider defining a more specific type for output
}

interface AgentPlaygroundProps {
  agentId: string;
}

export default function AgentPlayground({ agentId }: AgentPlaygroundProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [executionSteps, setExecutionSteps] = useState<ExecutionStepItem[]>([]);

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const agentData = await getAgent(agentId) as Agent; // Added type assertion
        setAgent(agentData);
      } catch (error) {
        toast.error('Failed to load agent data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamedResponse]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Clear input and start streaming
    setInput('');
    setIsStreaming(true);
    setStreamedResponse('');
    
    try {
      // Create a WebSocket connection for streaming
      const socket = createAgentStream(agentId, input, conversationId || undefined);
      
      // Track execution steps
      const steps: ExecutionStepItem[] = [];
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data as string); // Added type assertion for event.data
        
        // Handle different event types
        if (data.type === 'raw_response_event') {
          if (data.data && data.data.delta) {
            setStreamedResponse((prev) => prev + (data.data.delta || ''));
          }
        } else if (data.type === 'run_item_stream_event') {
          // Track tool calls and outputs for execution steps
          if (data.data && data.data.item) {
            const item = data.data.item as ExecutionStepItem; // Added type assertion
            if (item.type === 'tool_call_item' || item.type === 'tool_call_output_item') {
              steps.push(item);
              setExecutionSteps([...steps]);
            }
          }
        } else if (data.type === 'final_output') {
          // Set conversation ID from the response if not already set
          if (!conversationId && data.data.conversation_id) {
            setConversationId(data.data.conversation_id as string); // Added type assertion
          }
          
          // Add assistant message with final response
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'assistant', content: data.data.content as string } // Added type assertion
          ]);
          
          setIsStreaming(false);
          setStreamedResponse('');
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error (raw event):', event);
        try {
          console.error('WebSocket error (JSON.stringified event):', JSON.stringify(event));
        } catch (e: unknown) {
          console.error('Could not stringify WebSocket error event. Reason:', e);
        }
        // Attempt to log specific properties if they exist
        if (event instanceof ErrorEvent) {
            console.error('ErrorEvent message:', event.message);
        } else if (typeof event === 'object' && event !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorObject = event as any;
            if (errorObject.message) console.error('Error message:', errorObject.message);
            if (errorObject.code) console.error('Error code:', errorObject.code);
            if (errorObject.reason) console.error('Error reason:', errorObject.reason); // Common for CloseEvent
        }

        toast.error('Error in agent execution. See console for details.');
        setIsStreaming(false);
      };
      
      socket.onclose = () => {
        // If the socket closed prematurely (without a final output), show error
        if (isStreaming) {
          toast.error('Connection to agent closed unexpectedly');
          setIsStreaming(false);
        }
      };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsStreaming(false);
    }
  };

  const renderMessageContent = (content: string) => (
    <div className="prose dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        components={{
          pre: ({ ...props }: ClassAttributes<HTMLPreElement> & HTMLAttributes<HTMLPreElement>) => (
            <div className="relative my-2">
              <pre className="p-4 rounded-md bg-gray-100 dark:bg-gray-800 overflow-x-auto" {...props} />
            </div>
          ),
          code: ({ className, children, ...props }: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement>) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <div className="relative my-2">
                <pre className="p-4 rounded-md bg-gray-100 dark:bg-gray-800 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-2 text-xl font-semibold">Agent Not Found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            The agent you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button className="mt-4" onClick={() => router.push('/agents')}>
            Back to Agents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Model: {agent.model}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/agents/${agentId}/edit`)}>
              Edit Agent
            </Button>
            <Button variant="outline" onClick={() => router.push('/agents')}>
              Back to Agents
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="execution">Execution Steps</TabsTrigger>
            <TabsTrigger value="config">Agent Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <Card className="flex-1 flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-xl font-medium">Start a conversation</h3>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Send a message to interact with {agent.name}
                      </p>
                    </div>
                  ) : (
                    messages.map((message, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'flex-row-reverse' : ''
                          } max-w-[80%]`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {renderMessageContent(message.content)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Streaming message */}
                  {isStreaming && streamedResponse && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Bot size={16} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted">
                          {renderMessageContent(streamedResponse)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="border-t p-4">
                <form
                  className="flex w-full gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isStreaming}
                  />
                  <Button type="submit" disabled={!input.trim() || isStreaming}>
                    {isStreaming ? 'Thinking...' : <Send size={16} />}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="execution" className="flex-1 mt-0">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Execution Steps</CardTitle>
                <CardDescription>
                  See how the agent processes information and uses tools
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[50vh]">
                {executionSteps.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No execution steps yet. Send a message to see the agent in action.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {executionSteps.map((step, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={step.type.includes('output') ? 'secondary' : 'default'}>
                            {step.type}
                          </Badge>
                          {step.name && <span className="font-medium">{step.name}</span>}
                        </div>
                        <pre className="whitespace-pre-wrap bg-muted p-2 rounded text-sm overflow-x-auto">
                          {step.type === 'tool_call_item' 
                            ? JSON.stringify(step.args, null, 2)
                            : step.output && typeof step.output === 'object' ? JSON.stringify(step.output, null, 2) : step.output || JSON.stringify(step, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="config" className="flex-1 mt-0">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>
                  Details about this agent&apos;s configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[50vh]">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Instructions</h3>
                    <p className="whitespace-pre-wrap mt-1 p-4 bg-muted rounded-lg">
                      {agent.instructions}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold">Tools ({agent.tools?.length || 0})</h3>
                    {!agent.tools || agent.tools.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        This agent doesn&apos;t have any tools configured.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-4">
                        {agent.tools.map((tool: Tool, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <Badge>{tool.type}</Badge>
                                <h4 className="font-semibold">{tool.name}</h4>
                              </div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                              {tool.description}
                            </p>
                            {tool.type === 'function' && tool.function_code && (
                              <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto text-sm">
                                {tool.function_code}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}