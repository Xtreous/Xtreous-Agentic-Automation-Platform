import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { CollaborationMessage } from "./types";

export interface SendCollaborationMessageRequest {
  collaboration_id: number;
  from_agent_id: number;
  to_agent_id?: number;
  message_type: "handoff" | "request" | "response" | "update" | "question";
  content: string;
  metadata?: Record<string, any>;
}

// Sends a message in an agent collaboration.
export const sendCollaborationMessage = api<SendCollaborationMessageRequest, CollaborationMessage>(
  { expose: true, method: "POST", path: "/collaborations/:collaboration_id/messages" },
  async (req) => {
    // Validate collaboration exists
    const collaboration = await coreDB.queryRow`
      SELECT * FROM agent_collaborations WHERE id = ${req.collaboration_id}
    `;

    if (!collaboration) {
      throw APIError.notFound("collaboration not found");
    }

    // Validate from_agent is participating
    const participatingAgents = Array.isArray(collaboration.participating_agents) 
      ? collaboration.participating_agents 
      : [];

    if (!participatingAgents.includes(req.from_agent_id)) {
      throw APIError.invalidArgument("from_agent is not participating in this collaboration");
    }

    // Validate to_agent if specified
    if (req.to_agent_id && !participatingAgents.includes(req.to_agent_id)) {
      throw APIError.invalidArgument("to_agent is not participating in this collaboration");
    }

    const message = await coreDB.queryRow<CollaborationMessage>`
      INSERT INTO collaboration_messages (
        collaboration_id, from_agent_id, to_agent_id, message_type, content, metadata
      )
      VALUES (
        ${req.collaboration_id}, ${req.from_agent_id}, ${req.to_agent_id}, 
        ${req.message_type}, ${req.content}, ${JSON.stringify(req.metadata || {})}
      )
      RETURNING *
    `;

    if (!message) {
      throw APIError.internal("failed to send message");
    }

    // Parse the metadata JSON
    message.metadata = typeof message.metadata === 'string' 
      ? JSON.parse(message.metadata) 
      : message.metadata;

    return message;
  }
);
