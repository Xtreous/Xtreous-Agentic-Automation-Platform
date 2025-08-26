import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";

export interface StopDeploymentRequest {
  id: number;
}

export interface StopDeploymentResponse {
  message: string;
  deployment_id: number;
}

// Stops a running deployment.
export const stopDeployment = api<StopDeploymentRequest, StopDeploymentResponse>(
  { expose: true, method: "POST", path: "/deployments/:id/stop" },
  async (req) => {
    const deployment = await coreDB.queryRow<{ id: number; status: string; agent_id: number }>`
      SELECT id, status, agent_id FROM agent_deployments WHERE id = ${req.id}
    `;

    if (!deployment) {
      throw APIError.notFound("deployment not found");
    }

    if (deployment.status === 'stopped') {
      throw APIError.invalidArgument("deployment is already stopped");
    }

    if (deployment.status !== 'deployed') {
      throw APIError.invalidArgument("can only stop deployed agents");
    }

    // Update deployment status
    await coreDB.exec`
      UPDATE agent_deployments SET 
        status = 'stopped',
        updated_at = NOW()
      WHERE id = ${req.id}
    `;

    // Add deployment log
    await coreDB.exec`
      INSERT INTO deployment_logs (deployment_id, level, message)
      VALUES (${req.id}, 'info', 'Deployment stopped by user request')
    `;

    return {
      message: "Deployment stopped successfully",
      deployment_id: req.id
    };
  }
);
