// src/lib/api.ts

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, unknown> | unknown;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = { method: 'GET' }
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add API key if available
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  
  const fetchOptions: RequestInit = {
    method: options.method,
    headers,
    credentials: 'include',
  };
  
  if (options.body && options.method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred with the API request',
    }));
    throw new Error(error.message || 'An error occurred with the API request');
  }
  
  return response.json();
}

// Agent Types
export interface ToolConfig {
  name: string;
  description: string;
  type: 'function' | 'web_search' | 'file_search';
  function_code?: string;
  parameters?: Record<string, unknown>;
}

export interface AgentConfig {
  id: string;
  name: string;
  instructions: string;
  model: string;
  tools: ToolConfig[];
  created_at: string;
  updated_at: string;
}

export interface MessageItem {
  role: string;
  content: string;
}

export interface RunResponse {
  run_id: string;
  agent_id: string;
  conversation_id: string;
  final_output?: string;
  status: string;
}

// Agent API Functions
export async function listAgents(): Promise<AgentConfig[]> {
  return fetchAPI<AgentConfig[]>('api/agents');
}

export async function getAgent(id: string): Promise<AgentConfig> {
  return fetchAPI<AgentConfig>(`api/agents/${id}`);
}

export async function createAgent(agent: Omit<AgentConfig, 'id' | 'created_at' | 'updated_at'>): Promise<AgentConfig> {
  return fetchAPI<AgentConfig>('api/agents', {
    method: 'POST',
    body: agent,
  });
}

export async function updateAgent(id: string, agent: Partial<AgentConfig>): Promise<AgentConfig> {
  return fetchAPI<AgentConfig>(`api/agents/${id}`, {
    method: 'PUT',
    body: agent,
  });
}

export async function deleteAgent(id: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`api/agents/${id}`, {
    method: 'DELETE',
  });
}

// Conversation API Functions
export async function listConversations(): Promise<Record<string, MessageItem[]>> {
  return fetchAPI<Record<string, MessageItem[]>>('api/conversations');
}

export async function getConversation(id: string): Promise<MessageItem[]> {
  return fetchAPI<MessageItem[]>(`api/conversations/${id}`);
}

export async function deleteConversation(id: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`api/conversations/${id}`, {
    method: 'DELETE',
  });
}

// Agent Execution
export async function runAgent(
  agentId: string,
  input: string,
  conversationId?: string
): Promise<RunResponse> {
  return fetchAPI<RunResponse>('api/run', {
    method: 'POST',
    body: {
      agent_id: agentId,
      input,
      conversation_id: conversationId,
    },
  });
}

// WebSocket streaming
export function createAgentStream(agentId: string, input: string, conversationId?: string) {
  const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/api/stream/${agentId}`;
  const socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    socket.send(JSON.stringify({
      input,
      conversation_id: conversationId,
    }));
  };
  
  return socket;
}

// Get trace
export interface TraceData {
  raw_responses?: unknown[];
  new_items?: unknown[];
  timestamp?: string;
}

export async function getTrace(runId: string): Promise<TraceData> {
  return fetchAPI<TraceData>(`api/traces/${runId}`);
}

// Health check
export async function checkHealth(): Promise<{ status: string; models: string[] }> {
  return fetchAPI<{ status: string; models: string[] }>('api/health');
}

// Apply settings from localStorage to backend
export async function applySettings(): Promise<{ success: boolean; message: string }> {
  // This is a mock implementation - in a real app, you'd send the settings to the backend
  const azureSettings = localStorage.getItem('azureSettings');
  
  if (!azureSettings) {
    return { success: false, message: 'No settings found' };
  }
  
  try {
    // In a real app, you'd send this to an API endpoint
    // Here we're just simulating a successful response
    return { success: true, message: 'Settings applied successfully' };
  } catch (error) {
    console.error('Error applying settings:', error);
    return { success: false, message: 'Failed to apply settings' };
  }
}