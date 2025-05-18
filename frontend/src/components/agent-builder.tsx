'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { createAgent, updateAgent, getAgent } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define schema for form validation
const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters' }),
  model: z.string().min(1, { message: 'Please select a model' }),
  tools: z.array(
    z.object({
      name: z.string().min(3, { message: 'Tool name must be at least 3 characters' }),
      description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
      type: z.enum(['function', 'web_search', 'file_search']),
      function_code: z.string().optional(),
      parameters: z.any().optional(),
    })
  ).optional(),
});

// Models available in Azure OpenAI
const defaultModels = [
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

interface AgentBuilderProps {
  agentId?: string | null;
}

export default function AgentBuilder({ agentId = null }: AgentBuilderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modelOptions, setModelOptions] = useState(defaultModels);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      instructions: '',
      model: 'gpt-4.1',
      tools: [],
    },
  });

  // Load agent data if editing an existing agent
  useEffect(() => {
    if (agentId) {
      const fetchAgent = async () => {
        try {
          setLoading(true);
          const agent = await getAgent(agentId);
          form.reset({
            name: agent.name,
            instructions: agent.instructions,
            model: agent.model,
            tools: agent.tools || [],
          });
        } catch (error) {
          toast.error('Failed to load agent data');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAgent();
    }
  }, [agentId, form]);

  // Fetch available Azure OpenAI models from API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok' && data.models && data.models.length > 0) {
            // Transform model list from Azure
            const azureModels = data.models.map((model: string) => ({
              value: model,
              label: model,
            }));
            setModelOptions(azureModels);
          }
        }
      } catch (error) {
        console.error('Failed to fetch Azure OpenAI models', error);
      }
    };
    
    fetchModels();
  }, []);

  // Add a new tool to the form
  const addTool = (type: 'function' | 'web_search' | 'file_search') => {
    const currentTools = form.getValues('tools') || [];
    form.setValue('tools', [
      ...currentTools,
      {
        name: '',
        description: '',
        type,
        function_code: type === 'function' ? 'def my_tool(input_text: str) -> str:\n    """Tool description"""\n    return f"Processed: {input_text}"' : undefined,
        parameters: {},
      },
    ]);
    setActiveTab('tools');
  };

  // Remove a tool from the form
  const removeTool = (index: number) => {
    const currentTools = form.getValues('tools') || [];
    const updatedTools = currentTools.filter((_, i) => i !== index);
    form.setValue('tools', updatedTools);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const agentDataForApi = {
        ...values,
        tools: values.tools || [], // Ensure tools is an array, not undefined
      };

      if (agentId) {
        await updateAgent(agentId, agentDataForApi);
        toast.success('Agent updated successfully');
      } else {
        const agent = await createAgent(agentDataForApi);
        toast.success('Agent created successfully');
        router.push(`/agents/${agent.id}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to save agent');
      } else {
        toast.error('An unknown error occurred while saving agent');
      }
      console.error('Save agent error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">{agentId ? 'Edit Agent' : 'Create New Agent'}</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Settings</CardTitle>
                  <CardDescription>
                    Configure your agent&apos;s name, instructions, and model.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer Support Agent" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your agent.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelOptions.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The Azure OpenAI model deployment to use.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="You are a helpful customer support agent. Answer questions about our products and services."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed instructions for your agent. This guides the agent&apos;s behavior and responses.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tools">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Tools</CardTitle>
                  <CardDescription>
                    Add tools to give your agent additional capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTool('function')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Function Tool
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTool('web_search')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Web Search
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTool('file_search')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      File Search
                    </Button>
                  </div>

                  {(form.watch('tools') || []).length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">No tools added yet. Add a tool to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(form.watch('tools') || []).map((tool, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <Badge>{tool.type}</Badge>
                              <h3 className="font-semibold">{tool.name || 'New Tool'}</h3>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTool(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`tools.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tool Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="get_weather" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`tools.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Gets the current weather for a location."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {tool.type === 'function' && (
                              <FormField
                                control={form.control}
                                name={`tools.${index}.function_code`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Function Code</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        className="font-mono min-h-32"
                                        placeholder="def get_weather(location: str) -> str:\n    return f'Weather for {location}: Sunny'"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Define a Python function that will be called when this tool is invoked.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.push('/agents')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : agentId ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}