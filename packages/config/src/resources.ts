export const getResourceName = (env: string, baseName: string) => `${env}-${baseName}`;

export interface DynamoTableDef {
  tableName: string;
  partitionKey: { name: string; type: 'S' | 'N' };
  sortKey?: { name: string; type: 'S' | 'N' };
  globalSecondaryIndexes?: {
    indexName: string;
    partitionKey: { name: string; type: 'S' | 'N' };
    sortKey?: { name: string; type: 'S' | 'N' };
    projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE';
  }[];
  ttlAttribute?: string;
}

export const Tables: Record<string, DynamoTableDef> = {
  interventions: {
    tableName: 'interventions',
    partitionKey: { name: 'PK', type: 'S' },
    sortKey: { name: 'SK', type: 'S' },
    globalSecondaryIndexes: [
      { indexName: 'GSI1', partitionKey: { name: 'GSI1PK', type: 'S' }, sortKey: { name: 'GSI1SK', type: 'S' }, projectionType: 'ALL' },
      { indexName: 'GSI2', partitionKey: { name: 'GSI2PK', type: 'S' }, sortKey: { name: 'GSI2SK', type: 'S' }, projectionType: 'ALL' },
      { indexName: 'GSI3', partitionKey: { name: 'GSI3PK', type: 'S' }, sortKey: { name: 'GSI3SK', type: 'S' }, projectionType: 'ALL' },
      { indexName: 'GSI4', partitionKey: { name: 'GSI4PK', type: 'S' }, sortKey: { name: 'GSI4SK', type: 'S' }, projectionType: 'ALL' },
      { indexName: 'GSI5', partitionKey: { name: 'GSI5PK', type: 'S' }, sortKey: { name: 'GSI5SK', type: 'S' }, projectionType: 'ALL' },
      { indexName: 'GSI6', partitionKey: { name: 'GSI6PK', type: 'S' }, sortKey: { name: 'GSI6SK', type: 'S' }, projectionType: 'ALL' },
    ]
  },
  intervention_events: {
    tableName: 'intervention_events',
    partitionKey: { name: 'PK', type: 'S' },
    sortKey: { name: 'SK', type: 'S' },
    globalSecondaryIndexes: [
      { indexName: 'GSI1', partitionKey: { name: 'GSI1PK', type: 'S' }, sortKey: { name: 'GSI1SK', type: 'S' }, projectionType: 'ALL' }
    ]
  },
  directory: {
    tableName: 'directory',
    partitionKey: { name: 'PK', type: 'S' },
    sortKey: { name: 'SK', type: 'S' },
    globalSecondaryIndexes: [
      { indexName: 'GSI1', partitionKey: { name: 'GSI1PK', type: 'S' }, sortKey: { name: 'GSI1SK', type: 'S' }, projectionType: 'ALL' }
    ]
  },
  credentials: {
    tableName: 'credentials',
    partitionKey: { name: 'PK', type: 'S' }
  },
  schedules: {
    tableName: 'schedules',
    partitionKey: { name: 'PK', type: 'S' },
    sortKey: { name: 'SK', type: 'S' }
  },
  policies: {
    tableName: 'policies',
    partitionKey: { name: 'PK', type: 'S' },
    sortKey: { name: 'SK', type: 'S' }
  },
  deliveries: {
    tableName: 'deliveries',
    partitionKey: { name: 'PK', type: 'S' },
    sortKey: { name: 'SK', type: 'S' }
  },
  idempotency: {
    tableName: 'idempotency',
    partitionKey: { name: 'PK', type: 'S' },
    ttlAttribute: 'ttl'
  }
};

export interface SqsQueueDef {
  queueName: string;
  visibilityTimeoutSeconds: number;
  maxReceiveCount: number;
  hasDlq: boolean;
}

export const Queues: Record<string, SqsQueueDef> = {
  routing: {
    queueName: 'routing',
    visibilityTimeoutSeconds: 30,
    maxReceiveCount: 3,
    hasDlq: true
  },
  notification: {
    queueName: 'notification',
    visibilityTimeoutSeconds: 30,
    maxReceiveCount: 5,
    hasDlq: true
  },
  webhook: {
    queueName: 'webhook',
    visibilityTimeoutSeconds: 60,
    maxReceiveCount: 5,
    hasDlq: true
  },
  'audit-fanout': {
    queueName: 'audit-fanout',
    visibilityTimeoutSeconds: 60,
    maxReceiveCount: 5,
    hasDlq: true
  },
  analytics: {
    queueName: 'analytics',
    visibilityTimeoutSeconds: 300,
    maxReceiveCount: 3,
    hasDlq: true
  }
};

export const SchedulerGroups = {
  deadlines: 'deadlines'
};
