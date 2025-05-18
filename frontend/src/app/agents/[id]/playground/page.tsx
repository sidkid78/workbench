'use client';

import { useParams } from 'next/navigation';
import AgentPlayground from '@/components/agent-playground';

export default function AgentPlaygroundPage() {
  const params = useParams();
  const agentId = params.id as string;

  return <AgentPlayground agentId={agentId} />;
}