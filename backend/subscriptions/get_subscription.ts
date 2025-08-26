import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";

export interface Subscription {
  id: string;
  organizationId: string;
  tier: string;
  status: string;
  features: string[];
  limits: {
    maxAgents: number;
    maxTasks: number;
    maxUsers: number;
    storageGB: number;
  };
  billing: {
    amount: number;
    currency: string;
    interval: string;
    nextBillingDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Retrieves the current user's subscription information.
export const getSubscription = api<void, Subscription>(
  { expose: true, method: "GET", path: "/subscriptions/current", auth: true },
  async () => {
    const auth = getAuthData()!;
    
    if (!auth.organizationId) {
      throw APIError.notFound("no organization associated with user");
    }

    const subscription = await coreDB.queryRow<{
      id: number;
      organization_id: number;
      tier: string;
      status: string;
      features: string;
      max_agents: number;
      max_tasks: number;
      max_users: number;
      storage_gb: number;
      billing_amount: number;
      billing_currency: string;
      billing_interval: string;
      next_billing_date?: Date;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT 
        s.id, s.organization_id, s.tier, s.status, s.features,
        s.max_agents, s.max_tasks, s.max_users, s.storage_gb,
        s.billing_amount, s.billing_currency, s.billing_interval,
        s.next_billing_date, s.created_at, s.updated_at
      FROM subscriptions s
      WHERE s.organization_id = ${parseInt(auth.organizationId)}
    `;

    if (!subscription) {
      throw APIError.notFound("subscription not found");
    }

    return {
      id: subscription.id.toString(),
      organizationId: subscription.organization_id.toString(),
      tier: subscription.tier,
      status: subscription.status,
      features: typeof subscription.features === 'string' 
        ? JSON.parse(subscription.features) 
        : subscription.features,
      limits: {
        maxAgents: subscription.max_agents,
        maxTasks: subscription.max_tasks,
        maxUsers: subscription.max_users,
        storageGB: subscription.storage_gb
      },
      billing: {
        amount: subscription.billing_amount,
        currency: subscription.billing_currency,
        interval: subscription.billing_interval,
        nextBillingDate: subscription.next_billing_date
      },
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at
    };
  }
);
