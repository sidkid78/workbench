'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BookOpen, Info, Lightbulb } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <BookOpen className="mr-2 h-6 w-6" />
        <h1 className="text-3xl font-bold">Documentation</h1>
      </div>

      <Tabs defaultValue="getting-started">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="getting-started" 
                className="justify-start py-2 px-3 h-auto"
              >
                Getting Started
              </TabsTrigger>
              <TabsTrigger 
                value="azure-openai" 
                className="justify-start py-2 px-3 h-auto"
              >
                Azure OpenAI Setup
              </TabsTrigger>
              <TabsTrigger 
                value="agents" 
                className="justify-start py-2 px-3 h-auto"
              >
                Working with Agents
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="justify-start py-2 px-3 h-auto"
              >
                Agent Tools
              </TabsTrigger>
              <TabsTrigger 
                value="playground" 
                className="justify-start py-2 px-3 h-auto"
              >
                Using the Playground
              </TabsTrigger>
              <TabsTrigger 
                value="api" 
                className="justify-start py-2 px-3 h-auto"
              >
                API Reference
              </TabsTrigger>
              <TabsTrigger 
                value="troubleshooting" 
                className="justify-start py-2 px-3 h-auto"
              >
                Troubleshooting
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1">
            <TabsContent value="getting-started" className="mt-0 border-0 p-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Getting Started with AI Agent Workbench
                  </CardTitle>
                  <CardDescription>
                    Learn how to set up and start using the AI Agent Workbench
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Welcome to AI Agent Workbench</AlertTitle>
                    <AlertDescription>
                      This platform allows you to create, configure, and run AI agents using Azure OpenAI models.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Overview</h3>
                    <p>
                      AI Agent Workbench is a platform for building and running AI agents powered by Azure OpenAI. 
                      It provides a user-friendly interface for creating agents with specific instructions and tools, 
                      testing them in an interactive playground, and analyzing their execution.
                    </p>
                    
                    <h4 className="text-lg font-medium">Key Features</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Create custom agents with specific instructions</li>
                      <li>Add function tools to extend agent capabilities</li>
                      <li>Test agents in an interactive playground</li>
                      <li>View detailed execution traces</li>
                      <li>Seamless Azure OpenAI integration</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Quick Start Guide</h3>
                    
                    <div className="space-y-3">
                      <div className="flex">
                        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          1
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium">Configure Azure OpenAI</h4>
                          <p className="text-muted-foreground">
                            Go to the Settings page and configure your Azure OpenAI credentials.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          2
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium">Create Your First Agent</h4>
                          <p className="text-muted-foreground">
                            Navigate to the Agents page and click &quot;Create Agent&quot; to set up your first AI agent.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          3
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium">Add Tools (Optional)</h4>
                          <p className="text-muted-foreground">
                            Enhance your agent with function tools, web search, or file search capabilities.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          4
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium">Test Your Agent</h4>
                          <p className="text-muted-foreground">
                            Open your agent in the playground and start interacting with it.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">System Requirements</h3>
                    <ul className="space-y-2">
                      <li>
                        <strong>Azure OpenAI Account:</strong> An Azure account with Azure OpenAI resource
                      </li>
                      <li>
                        <strong>Modern Web Browser:</strong> Chrome, Firefox, Safari, or Edge
                      </li>
                      <li>
                        <strong>Internet Connection:</strong> Required for API calls to Azure OpenAI
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="playground" className="mt-0 border-0 p-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Using the Playground
                  </CardTitle>
                  <CardDescription>
                    Test and interact with agents in the playground
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p>
                      The Agent Playground provides an interactive environment for testing and interacting with your agents.
                      You can see how agents respond to different inputs and examine their execution steps.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Starting the Playground</h3>
                    <ol className="list-decimal pl-6 space-y-3">
                      <li>Navigate to the Agents page</li>
                      <li>Click on an agent to view its details</li>
                      <li>Click &quot;Run Agent&quot; or navigate to the agent&apos;s playground</li>
                    </ol>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Playground Features</h3>
                    
                    <div className="space-y-3">
                      <h4 className="text-lg font-medium">Chat Interface</h4>
                      <p>
                        The main tab of the playground provides a chat interface for interacting with your agent.
                        Type messages in the input box and see the agent&apos;s responses in real-time.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-lg font-medium">Execution Steps</h4>
                      <p>
                        The &quot;Execution Steps&quot; tab shows a detailed log of how the agent processes information and uses tools.
                        This is useful for debugging and understanding the agent&apos;s behavior.
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Tool calls show what tools the agent invoked and with what parameters</li>
                        <li>Tool outputs show the results returned by each tool</li>
                        <li>You can see the sequence of operations the agent performed</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-lg font-medium">Agent Configuration</h4>
                      <p>
                        The &quot;Agent Configuration&quot; tab displays the current configuration of the agent, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>The agent&apos;s instructions</li>
                        <li>The tools available to the agent</li>
                        <li>The model being used</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Testing and Debugging Tips</h3>
                    <ul className="list-disc pl-6 space-y-3">
                      <li>
                        <strong>Start with simple queries</strong>
                        <p className="text-muted-foreground">Begin with straightforward requests to ensure the agent works as expected.</p>
                      </li>
                      <li>
                        <strong>Test edge cases</strong>
                        <p className="text-muted-foreground">Try unusual or unexpected inputs to see how the agent handles them.</p>
                      </li>
                      <li>
                        <strong>Examine tool usage</strong>
                        <p className="text-muted-foreground">Check the Execution Steps tab to see if the agent is using tools appropriately.</p>
                      </li>
                      <li>
                        <strong>Refine instructions</strong>
                        <p className="text-muted-foreground">If the agent isn&apos;t behaving as expected, refine its instructions and try again.</p>
                      </li>
                      <li>
                        <strong>Test different models</strong>
                        <p className="text-muted-foreground">Try different Azure OpenAI models to see which works best for your use case.</p>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="troubleshooting" className="mt-0 border-0 p-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Troubleshooting
                  </CardTitle>
                  <CardDescription>
                    Common issues and how to resolve them
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p>
                      This section covers common issues you may encounter when using the AI Agent Workbench and how to resolve them.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Azure OpenAI Connection Issues</h3>
                    
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-lg font-medium">Failed to connect to Azure OpenAI</h4>
                      <div className="space-y-2 mt-2">
                        <p className="font-medium">Possible causes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Incorrect API Key or Endpoint URL</li>
                          <li>Azure OpenAI resource is not properly configured</li>
                          <li>Network connectivity issues</li>
                        </ul>
                        
                        <p className="font-medium mt-3">Solutions:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Double-check your API Key and Endpoint URL in the Settings page</li>
                          <li>Verify that your Azure OpenAI resource is active in the Azure Portal</li>
                          <li>Check your network connectivity</li>
                          <li>Make sure your Azure OpenAI API key has the necessary permissions</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md mt-4">
                      <h4 className="text-lg font-medium">Model not found</h4>
                      <div className="space-y-2 mt-2">
                        <p className="font-medium">Possible causes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>The model deployment name is incorrect</li>
                          <li>The model isn&apos;t deployed in your Azure OpenAI resource</li>
                        </ul>
                        
                        <p className="font-medium mt-3">Solutions:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Check your model deployment names in the Settings page</li>
                          <li>Verify that the model is deployed in your Azure OpenAI resource</li>
                          <li>Make sure the deployment name in the workbench matches the one in Azure</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Agent Issues</h3>
                    
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-lg font-medium">Agent not responding as expected</h4>
                      <div className="space-y-2 mt-2">
                        <p className="font-medium">Possible causes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Unclear or insufficient instructions</li>
                          <li>Model limitations</li>
                          <li>Tool configuration issues</li>
                        </ul>
                        
                        <p className="font-medium mt-3">Solutions:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Refine and clarify your agent&apos;s instructions</li>
                          <li>Try a more capable model (e.g., 4.1 instead of GPT-3.5)</li>
                          <li>Check your tool configuration and make sure the tools are working correctly</li>
                          <li>Review the execution steps to see where things might be going wrong</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md mt-4">
                      <h4 className="text-lg font-medium">Tool execution fails</h4>
                      <div className="space-y-2 mt-2">
                        <p className="font-medium">Possible causes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Syntax errors in function tool code</li>
                          <li>Missing required parameters</li>
                          <li>External service dependencies are unavailable</li>
                        </ul>
                        
                        <p className="font-medium mt-3">Solutions:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Check your function tool code for syntax errors</li>
                          <li>Make sure all required parameters are being provided</li>
                          <li>Verify that any external services your tools depend on are available</li>
                          <li>Add error handling to your function tools</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">UI Issues</h3>
                    
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-lg font-medium">Missing UI elements</h4>
                      <div className="space-y-2 mt-2">
                        <p className="font-medium">Possible causes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>JavaScript errors</li>
                          <li>CSS issues</li>
                          <li>Browser compatibility problems</li>
                        </ul>
                        
                        <p className="font-medium mt-3">Solutions:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Check the browser console for errors</li>
                          <li>Try clearing your browser cache and reloading</li>
                          <li>Try using a different browser</li>
                          <li>Make sure you&apos;re using a modern, supported browser</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md mt-4">
                      <h4 className="text-lg font-medium">Slow performance</h4>
                      <div className="space-y-2 mt-2">
                        <p className="font-medium">Possible causes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Network latency</li>
                          <li>Azure OpenAI API response times</li>
                          <li>Complex agent operations</li>
                        </ul>
                        
                        <p className="font-medium mt-3">Solutions:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Check your network connection</li>
                          <li>Use a faster model if available</li>
                          <li>Simplify your agent&apos;s tools and instructions</li>
                          <li>Consider upgrading your Azure OpenAI resource for better performance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Getting Help</h3>
                    <p>
                      If you&apos;re still experiencing issues after trying the solutions above, here are some additional resources:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Azure OpenAI Documentation:</strong> For Azure OpenAI-specific issues, refer to the <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/" target="_blank" rel="noopener noreferrer" className="text-primary underline">official documentation</a>.
                      </li>
                      <li>
                        <strong>OpenAI Agents SDK Documentation:</strong> For agent-related issues, see the <a href="https://github.com/openai/openai-agents-python/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenAI Agents SDK documentation</a>.
                      </li>
                      <li>
                        <strong>GitHub Issues:</strong> Check the <a href="https://github.com/openai/openai-agents-python/issues" target="_blank" rel="noopener noreferrer" className="text-primary underline">GitHub issues</a> for the OpenAI Agents SDK for known issues and solutions.
                      </li>
                      <li>
                        <strong>Support:</strong> Contact our support team at support@example.com for additional assistance.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}