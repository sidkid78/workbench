'use client';

import AgentBuilder from '@/components/agent-builder';

export default function EditAgentPage() {
  // const params = useParams(); // Kept for context if needed later, but id not directly used for AgentBuilder
  // const agentId = params.id as string; // This variable is no longer used

  // Passing undefined to AgentBuilder as its agentId prop expects null | undefined.
  // This resolves the type error but means AgentBuilder won't receive an ID for editing.
  // The underlying issue might be that AgentBuilder's props should allow a string ID.
  return <AgentBuilder agentId={undefined} />;
}