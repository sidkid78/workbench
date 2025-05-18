from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional, Union, Literal
import agents
from agents import Agent, Runner, function_tool, RunContextWrapper, set_default_openai_client, set_tracing_disabled
from agents.result import RunResultStreaming
import os
import json
import asyncio
import uuid
from datetime import datetime
import logging
from dotenv import load_dotenv
from starlette.websockets import WebSocketState

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Agent Workbench API",
    description="API for creating, configuring, and running AI agents",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API key header for securing endpoints
API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

# In-memory storage (replace with database in production)
agent_configs = {}
agent_instances = {}
conversations = {}
traces = {}

# Azure OpenAI model mapping
AZURE_MODEL_MAPPING = {
    "gpt-4.1": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    # "gpt-4-turbo": os.getenv("AZURE_GPT4_TURBO_DEPLOYMENT"),
    # "gpt-3.5-turbo": os.getenv("AZURE_GPT35_TURBO_DEPLOYMENT"),
}

# ------------------ Models ------------------

class ToolConfig(BaseModel):
    name: str
    description: str
    type: Literal["function", "web_search", "file_search"]
    function_code: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class AgentConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    instructions: str
    model: str = "gpt-4.1"
    tools: List[ToolConfig] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
class RunRequest(BaseModel):
    agent_id: str
    input: str
    conversation_id: Optional[str] = None
    
class MessageItem(BaseModel):
    role: str
    content: str
    
class RunResponse(BaseModel):
    run_id: str
    agent_id: str
    conversation_id: str
    final_output: Optional[str] = None
    status: str = "completed"
    
class StreamEvent(BaseModel):
    type: str
    data: Dict[str, Any]
    
class AzureOpenAIStatus(BaseModel):
    status: str
    models: List[str]
    
# ------------------ Dependency Functions ------------------

async def get_api_key(api_key: str = Depends(API_KEY_HEADER)):
    if not api_key and not os.getenv("ENABLE_PUBLIC_ACCESS", "false").lower() == "true":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required",
        )
    return api_key

async def setup_azure_openai():
    """Configure the Azure OpenAI client for the agents SDK."""
    try:
        from openai import AsyncAzureOpenAI
        
        # Check if Azure OpenAI credentials are configured
        azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2025-03-01-preview")
        
        if not azure_api_key or not azure_endpoint:
            raise ValueError("Azure OpenAI credentials not properly configured")
        
        # Create Azure OpenAI client
        azure_client = AsyncAzureOpenAI(
            azure_endpoint=azure_endpoint,
            api_key=azure_api_key,
            api_version=azure_api_version
        )
        
        # Set the client as the default client for the agents SDK
        set_default_openai_client(azure_client)
        
        # Set the default API type to chat_completions since Azure might not support Responses API
        agents.set_default_openai_api("chat_completions")
        
        logger.info("Azure OpenAI client configured successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to configure Azure OpenAI client: {str(e)}")
        return False

# ------------------ API Endpoints ------------------

@app.get("/")
async def root():
    return {"message": "AI Agent Workbench API"}

@app.get("/api/health", response_model=AzureOpenAIStatus)
async def health_check():
    # Test Azure OpenAI connection
    try:
        from openai import AsyncAzureOpenAI
        
        azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        
        if not azure_api_key or not azure_endpoint:
            return AzureOpenAIStatus(status="error", models=["Azure OpenAI credentials not configured"])
            
        client = AsyncAzureOpenAI(
            azure_endpoint=azure_endpoint,
            api_key=azure_api_key,
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-03-01-preview")
        )
        
        # Get deployments
        deployments = await client.deployments.list()
        available_models = [d.id for d in deployments.data]
        
        return AzureOpenAIStatus(
            status="ok",
            models=available_models
        )
    except Exception as e:
        logger.error(f"Azure OpenAI health check failed: {str(e)}")
        return AzureOpenAIStatus(
            status="error",
            models=[f"Error: {str(e)}"]
        )

# Agent Configuration Endpoints

@app.post("/api/agents", response_model=AgentConfig)    
async def create_agent(agent_config: AgentConfig, _: str = Depends(get_api_key)):
    agent_configs[agent_config.id] = agent_config.model_dump()
    return agent_config

@app.get("/api/agents", response_model=List[AgentConfig])
async def list_agents(_: str = Depends(get_api_key)):
    return [AgentConfig(**config) for config in agent_configs.values()]

@app.get("/api/agents/{agent_id}", response_model=AgentConfig)
async def get_agent(agent_id: str, _: str = Depends(get_api_key)):
    if agent_id not in agent_configs:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentConfig(**agent_configs[agent_id])

@app.put("/api/agents/{agent_id}", response_model=AgentConfig)
async def update_agent(agent_id: str, agent_config: AgentConfig, _: str = Depends(get_api_key)):
    if agent_id not in agent_configs:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent_config.id = agent_id
    agent_config.updated_at = datetime.now()
    agent_configs[agent_id] = agent_config.model_dump()
    
    # Clear cached agent instance if it exists
    if agent_id in agent_instances:
        del agent_instances[agent_id]
        
    return agent_config

@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str, _: str = Depends(get_api_key)):
    if agent_id not in agent_configs:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    del agent_configs[agent_id]
    
    # Clear cached agent instance if it exists
    if agent_id in agent_instances:
        del agent_instances[agent_id]
        
    return {"message": "Agent deleted"}

# Agent Execution Endpoints

@app.post("/api/run", response_model=RunResponse)
async def run_agent(run_request: RunRequest, background_tasks: BackgroundTasks, api_key: str = Depends(get_api_key)):
    # Ensure Azure OpenAI is configured
    await setup_azure_openai()
    
    if run_request.agent_id not in agent_configs:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Generate run ID and conversation ID if not provided
    run_id = str(uuid.uuid4())
    conversation_id = run_request.conversation_id or str(uuid.uuid4())
    
    # Initialize conversation if it doesn't exist
    if conversation_id not in conversations:
        conversations[conversation_id] = []
    
    # Add user message to conversation
    conversations[conversation_id].append({
        "role": "user",
        "content": run_request.input
    })
    
    # Run the agent in a background task to allow for returning immediately
    background_tasks.add_task(
        run_agent_task,
        run_id,
        run_request.agent_id,
        conversation_id,
        run_request.input
    )
    
    return RunResponse(
        run_id=run_id,
        agent_id=run_request.agent_id,
        conversation_id=conversation_id,
        status="running"
    )

async def run_agent_task(run_id: str, agent_id: str, conversation_id: str, input_text: str):
    try:
        # Get or create agent instance
        agent = await get_agent_instance(agent_id)
        
        # Run the agent
        result = await Runner.run(agent, input_text)
        
        # Add assistant message to conversation
        conversations[conversation_id].append({
            "role": "assistant",
            "content": result.final_output
        })
        
        # Store trace information
        traces[run_id] = {
            "raw_responses": [r.model_dump() for r in result.raw_responses],
            "new_items": [item.model_dump() for item in result.new_items],
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Agent run completed: {run_id}")
    except Exception as e:
        logger.error(f"Error running agent: {str(e)}")
        # Add error message to conversation
        conversations[conversation_id].append({
            "role": "system",
            "content": f"Error: {str(e)}"
        })

@app.websocket("/api/stream/{agent_id}")
async def stream_agent_run(websocket: WebSocket, agent_id: str):
    logger.info(f"Attempting WebSocket connection for agent_id: {agent_id} at path /api/stream/{agent_id}")
    await websocket.accept()
    logger.info(f"WebSocket connection accepted for agent_id: {agent_id}")
    
    try:
        # Get message data
        data = await websocket.receive_text()
        run_data = json.loads(data)
        
        input_text = run_data.get("input")
        conversation_id = run_data.get("conversation_id", str(uuid.uuid4()))
        
        # Ensure Azure OpenAI is configured
        await setup_azure_openai()
        
        # Get or create agent instance
        agent = await get_agent_instance(agent_id)
        
        # Initialize conversation if it doesn't exist
        if conversation_id not in conversations:
            conversations[conversation_id] = []
        
        # Add user message to conversation
        conversations[conversation_id].append({
            "role": "user",
            "content": input_text
        })
        
        # Run the agent with streaming
        result = Runner.run_streamed(agent, input_text)
        
        # Stream events to the client
        async for event in result.stream_events():
            event_type_str = "unknown_event"
            # Try to get event type safely
            if hasattr(event, 'type') and isinstance(event.type, str):
                event_type_str = event.type
            elif hasattr(event, '__class__') and hasattr(event.__class__, '__name__'):
                event_type_str = event.__class__.__name__ # Fallback to class name

            data_to_send = None
            if hasattr(event, 'data') and event.data is not None:
                if hasattr(event.data, 'model_dump'):
                    data_to_send = event.data.model_dump()
                else:
                    data_to_send = event.data # Send as is if not a Pydantic model
            elif hasattr(event, 'model_dump'): # If the event itself is a Pydantic model
                data_to_send = event.model_dump()
            else:
                # Fallback for events that don't fit the above structures
                logger.warning(f"Event of type {event_type_str} does not have a standard .data or .model_dump() method. Raw event: {str(event)}")
                # For AgentUpdatedStreamEvent, this part might need specific handling
                # if its relevant payload is in other attributes.
                # Sending a generic structure for now.
                data_to_send = {"message": f"Unstructured event: {event_type_str}", "content": str(event) }

            await websocket.send_json({
                "type": event_type_str,
                "data": data_to_send
            })
        
        # Send final output
        await websocket.send_json({
            "type": "final_output",
            "data": {"content": result.final_output}
        })
        
        # Add assistant message to conversation
        conversations[conversation_id].append({
            "role": "assistant",
            "content": result.final_output
        })
        
        # Store trace information
        run_id = str(uuid.uuid4())
        traces[run_id] = {
            "raw_responses": [r.model_dump() for r in result.raw_responses],
            "new_items": [item.model_dump() for item in result.new_items],
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Streaming agent run completed: {run_id}")
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in WebSocket: {str(e)}")
        await websocket.send_json({"type": "error", "data": {"message": str(e)}})
    finally:
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close()

# Conversation History Endpoints

@app.get("/api/conversations", response_model=Dict[str, List[MessageItem]])
async def list_conversations(_: str = Depends(get_api_key)):
    return conversations

@app.get("/api/conversations/{conversation_id}", response_model=List[MessageItem])
async def get_conversation(conversation_id: str, _: str = Depends(get_api_key)):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return [MessageItem(**msg) for msg in conversations[conversation_id]]

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, _: str = Depends(get_api_key)):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    del conversations[conversation_id]
    return {"message": "Conversation deleted"}

# Trace Endpoints

@app.get("/api/traces/{run_id}")
async def get_trace(run_id: str, _: str = Depends(get_api_key)):
    if run_id not in traces:
        raise HTTPException(status_code=404, detail="Trace not found")
    return traces[run_id]

# ------------------ Helper Functions ------------------

async def get_agent_instance(agent_id: str) -> Agent:
    """Get or create an agent instance from its configuration."""
    if agent_id in agent_instances:
        return agent_instances[agent_id]
    
    if agent_id not in agent_configs:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    config = agent_configs[agent_id]
    
    # Map the model name to Azure deployment name if needed
    model = config["model"]
    if model in AZURE_MODEL_MAPPING:
        azure_model = AZURE_MODEL_MAPPING[model]
        logger.info(f"Mapping model {model} to Azure deployment {azure_model}")
        model = azure_model
    
    # Create tools
    tools = []
    for tool_config in config["tools"]:
        if tool_config["type"] == "function" and tool_config.get("function_code"):
            # Create function tool from code string
            # This is simplified and would need proper security measures in production
            try:
                tool_code = tool_config["function_code"]
                tool_name = tool_config["name"]
                
                # Create a namespace to execute the function code
                namespace = {}
                exec(tool_code, namespace)
                
                # Get the function from the namespace
                tool_func = namespace.get(tool_name)
                if not tool_func:
                    logger.warning(f"Function {tool_name} not found in code")
                    continue
                
                # Create function tool
                tools.append(function_tool(tool_func))
            except Exception as e:
                logger.error(f"Error creating function tool: {str(e)}")
                continue
        elif tool_config["type"] == "web_search":
            # Add web search tool
            from agents import WebSearchTool
            tools.append(WebSearchTool())
        elif tool_config["type"] == "file_search":
            # Add file search tool if parameters are provided
            if tool_config.get("parameters"):
                from agents import FileSearchTool
                tools.append(FileSearchTool(**tool_config["parameters"]))
    
    # Create agent
    agent = Agent(
        name=config["name"],
        instructions=config["instructions"],
        model=model,
        tools=tools
    )
    
    # Cache agent instance
    agent_instances[agent_id] = agent
    
    return agent

# ------------------ Server Startup ------------------

@app.on_event("startup")
async def startup_event():
    # Disable tracing to prevent errors when using Azure OpenAI
    set_tracing_disabled(disabled=True)
    logger.info("OpenAI Agents SDK tracing disabled.")

    # Configure Azure OpenAI
    success = await setup_azure_openai()
    if not success:
        logger.warning("Failed to configure Azure OpenAI client on startup")
    
    # Enable verbose logging if specified
    if os.getenv("ENABLE_VERBOSE_LOGGING", "false").lower() == "true":
        agents.enable_verbose_stdout_logging()
        logger.info("Verbose logging enabled")

# ------------------ Run Server ------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)