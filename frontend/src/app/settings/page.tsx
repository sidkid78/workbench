'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const azureSettingsSchema = z.object({
  apiKey: z.string().min(1, { message: 'API Key is required' }),
  endpoint: z.string().url({ message: 'Please enter a valid URL' }),
  apiVersion: z.string().min(1, { message: 'API Version is required' }),
  gpt4oDeployment: z.string().min(1, { message: 'Deployment name is required' }),
  gpt4TurboDeployment: z.string().optional(),
  gpt35TurboDeployment: z.string().optional(),
});

type AzureSettings = z.infer<typeof azureSettingsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('azure');

  const form = useForm<AzureSettings>({
    resolver: zodResolver(azureSettingsSchema),
    defaultValues: {
      apiKey: '',
      endpoint: '',
      apiVersion: '2025-03-01-preview',
      gpt4oDeployment: 'gpt-4.1',
      gpt4TurboDeployment: 'gpt-4-turbo',
      gpt35TurboDeployment: 'gpt-35-turbo',
    },
  });

  // Load settings from local storage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('azureSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        form.reset(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved settings', error);
      }
    }
  }, [form]);

  // Test connection to Azure OpenAI
  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('unknown');
    
    try {
      const response = await fetch('/api/health');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'ok') {
          setConnectionStatus('success');
          setAvailableModels(data.models || []);
          toast.success('Successfully connected to Azure OpenAI');
        } else {
          setConnectionStatus('error');
          toast.error(`Connection failed: ${data.models ? data.models[0] : 'Unknown error'}`);
        }
      } else {
        setConnectionStatus('error');
        toast.error('Failed to connect to Azure OpenAI');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Connection test failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings
  const onSubmit = (data: AzureSettings) => {
    setIsLoading(true);
    
    try {
      // Save to local storage
      localStorage.setItem('azureSettings', JSON.stringify(data));
      
      // Save to backend settings (in a real app)
      // This would typically be an API call to update settings on the server
      
      toast.success('Settings saved successfully');
      
      // Test the connection with the new settings
      testConnection();
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="azure">Azure OpenAI</TabsTrigger>
          <TabsTrigger value="app">Application</TabsTrigger>
        </TabsList>
        
        <TabsContent value="azure">
          <Card>
            <CardHeader>
              <CardTitle>Azure OpenAI Configuration</CardTitle>
              <CardDescription>
                Configure your Azure OpenAI credentials for accessing AI models.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your Azure OpenAI API Key" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Your API key from the Azure Portal.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endpoint</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://your-resource-name.openai.azure.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Your Azure OpenAI endpoint URL.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="apiVersion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Version</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="2025-03-01-preview" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Azure OpenAI API version (e.g., 2025-03-01-preview).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Model Deployments</h3>
                      <p className="text-muted-foreground mb-4">
                        Enter the deployment names for your Azure OpenAI models. These names map to the standard OpenAI model names in the application.
                      </p>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="gpt4oDeployment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPT-4.1 Deployment Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="gpt-4.1" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Your deployment name for GPT-4.1.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gpt4TurboDeployment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPT-4 Turbo Deployment Name (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="gpt-4-turbo" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Your deployment name for GPT-4 Turbo (if available).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gpt35TurboDeployment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPT-3.5 Turbo Deployment Name (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="gpt-35-turbo" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Your deployment name for GPT-3.5 Turbo (if available).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testConnection}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : connectionStatus === 'success' ? (
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      ) : connectionStatus === 'error' ? (
                        <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      ) : null}
                      Test Connection
                    </Button>
                  </div>
                </form>
              </Form>
              
              {connectionStatus === 'success' && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="flex items-center text-lg font-medium text-green-800 dark:text-green-300 mb-2">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Connection Successful
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-2">
                    Successfully connected to Azure OpenAI.
                  </p>
                  {availableModels.length > 0 && (
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-300">Available models:</p>
                      <ul className="list-disc list-inside mt-1 text-green-700 dark:text-green-300">
                        {availableModels.map((model, index) => (
                          <li key={index}>{model}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {connectionStatus === 'error' && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="flex items-center text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Connection Failed
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    Could not connect to Azure OpenAI. Please check your credentials and try again.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure general application settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Dark Mode
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme.
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Enable Verbose Logging
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed logs for debugging.
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Store Conversation History
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Save conversations for future reference.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Stream Agent Responses
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Show responses as they are generated.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}