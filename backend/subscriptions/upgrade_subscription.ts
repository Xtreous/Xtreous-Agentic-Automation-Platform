import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { coreDB } from "../core/db";
import { checkPermission } from "../users/permissions";
import type { Subscription } from "./get_subscription";

export interface UpgradeSubscriptionRequest {
  tier: string;
  billingInterval: string;
}

// Upgrades the organization's subscription tier.
export const upgradeSubscription = api<UpgradeSubscriptionRequest, Subscription>(
  { expose: true, method: "POST", path: "/subscriptions/upgrade", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if user has permission to manage organization
    await checkPermission(auth.userID, 'manage_organization_agents');

    if (!auth.organizationId) {
      throw APIError.notFound("no organization associated with user");
    }

    // Validate tier
    const validTiers = ['free', 'starter', 'professional', 'enterprise'];
    if (!validTiers.includes(req.tier)) {
      throw APIError.invalidArgument("invalid subscription tier");
    }

    // Validate billing interval
    const validIntervals = ['monthly', 'yearly'];
    if (!validIntervals.includes(req.billingInterval)) {
      throw APIError.invalidArgument("invalid billing interval");
    }

    // Get tier configuration
    const tierConfig = getTierConfig(req.tier, req.billingInterval);

    // Update subscription
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
      UPDATE subscriptions SET
        tier = ${req.tier},
        status = 'active',
        features = ${JSON.stringify(tierConfig.features)},
        max_agents = ${tierConfig.limits.maxAgents},
        max_tasks = ${tierConfig.limits.maxTasks},
        max_users = ${tierConfig.limits.maxUsers},
        storage_gb = ${tierConfig.limits.storageGB},
        billing_amount = ${tierConfig.billing.amount},
        billing_currency = ${tierConfig.billing.currency},
        billing_interval = ${req.billingInterval},
        next_billing_date = ${tierConfig.billing.nextBillingDate},
        updated_at = NOW()
      WHERE organization_id = ${parseInt(auth.organizationId)}
      RETURNING 
        id, organization_id, tier, status, features,
        max_agents, max_tasks, max_users, storage_gb,
        billing_amount, billing_currency, billing_interval,
        next_billing_date, created_at, updated_at
    `;

    if (!subscription) {
      throw APIError.internal("failed to update subscription");
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

function getTierConfig(tier: string, interval: string) {
  const configs = {
    free: {
      features: ['basic_agents', 'basic_workflows'],
      limits: { maxAgents: 3, maxTasks: 100, maxUsers: 1, storageGB: 1 },
      billing: { amount: 0, currency: 'USD', nextBillingDate: null }
    },
    starter: {
      features: ['basic_agents', 'basic_workflows', 'integrations', 'email_support'],
      limits: { maxAgents: 10, maxTasks: 1000, maxUsers: 5, storageGB: 10 },
      billing: { 
        amount: interval === 'yearly' ? 240 : 25, 
        currency: 'USD', 
        nextBillingDate: new Date(Date.now() + (interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      }
    },
    professional: {
      features: ['advanced_agents', 'advanced_workflows', 'integrations', 'analytics', 'priority_support'],
      limits: { maxAgents: 50, maxTasks: 10000, maxUsers: 25, storageGB: 100 },
      billing: { 
        amount: interval === 'yearly' ? 960 : 99, 
        currency: 'USD', 
        nextBillingDate: new Date(Date.now() + (interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      }
    },
    enterprise: {
      features: ['enterprise_agents', 'enterprise_workflows', 'all_integrations', 'advanced_analytics', 'dedicated_support', 'sso'],
      limits: { maxAgents: -1, maxTasks: -1, maxUsers: -1, storageGB: 1000 },
      billing: { 
        amount: interval === 'yearly' ? 4800 : 499, 
        currency: 'USD', 
        nextBillingDate: new Date(Date.now() + (interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      }
    }
  };

  return configs[tier as keyof typeof configs] || configs.free;
}
