import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Tables, getResourceName } from '@bothandlers/config';

const ENV = 'local';
const REGION = 'us-east-1';
const ENDPOINT = process.env.AWS_ENDPOINT_URL || 'http://localhost:4566';
const ddb = new DynamoDBClient({ region: REGION, endpoint: ENDPOINT, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });

const directoryTableName = getResourceName(ENV, Tables.directory.tableName);
const schedulesTableName = getResourceName(ENV, Tables.schedules.tableName);
const policiesTableName = getResourceName(ENV, Tables.policies.tableName);
const credentialsTableName = getResourceName(ENV, Tables.credentials.tableName);

async function seed() {
  console.log('Seeding demo data...');

  const orgId = 'demo-org';
  const teamId = 'platform-team';
  const userId = 'alice';
  const agentId = 'demo-agent';
  const scheduleId = 'primary-schedule';
  const escPolId = 'default-escalation';
  const routePolId = 'default-routing';
  const credentialHash = 'demo-agent-hash-placeholder'; // Normally a SHA256 of the token

  const items = [
    // 1. Organization
    {
      TableName: directoryTableName,
      Item: {
        PK: { S: `ORG#${orgId}` },
        SK: { S: `ORG#${orgId}` },
        name: { S: 'Demo Organization' }
      }
    },
    // 2. User
    {
      TableName: directoryTableName,
      Item: {
        PK: { S: `ORG#${orgId}` },
        SK: { S: `USER#${userId}` },
        name: { S: 'Alice OnCall' },
        email: { S: 'alice@example.com' }
      }
    },
    // 3. Agent
    {
      TableName: directoryTableName,
      Item: {
        PK: { S: `ORG#${orgId}` },
        SK: { S: `AGENT#${agentId}` },
        name: { S: 'Demo Agent' }
      }
    },
    // 4. Team
    {
      TableName: directoryTableName,
      Item: {
        PK: { S: `ORG#${orgId}` },
        SK: { S: `TEAM#${teamId}` },
        name: { S: 'Platform Team' }
      }
    },
    // 5. Team Membership
    {
      TableName: directoryTableName,
      Item: {
        PK: { S: `ORG#${orgId}` },
        SK: { S: `MEMBER#${teamId}#USER#${userId}` },
        GSI1PK: { S: `ORG#${orgId}#USER#${userId}` },
        GSI1SK: { S: `MEMBER#${teamId}` }
      }
    },
    // 6. Schedule
    {
      TableName: schedulesTableName,
      Item: {
        PK: { S: `ORG#${orgId}#SCHED#${scheduleId}` },
        SK: { S: 'LAYER#1' },
        name: { S: 'Primary On-Call' },
        targets: { S: JSON.stringify([{ type: 'user', id: userId }]) }
      }
    },
    // 7. Authority Grant / Policies
    {
      TableName: policiesTableName,
      Item: {
        PK: { S: `ORG#${orgId}` },
        SK: { S: `ESCPOL#${escPolId}` },
        name: { S: 'Default Escalation' },
        levels: { S: JSON.stringify([{ targetId: teamId, delaySeconds: 300 }]) }
      }
    },
    {
      TableName: policiesTableName,
      Item: {
        PK: { S: `ORG#${orgId}` },
        SK: { S: `ROUTEPOL#${routePolId}` },
        name: { S: 'Default Routing' },
        rules: { S: JSON.stringify([{ type: 'catch_all', escalationPolicyId: escPolId }]) }
      }
    },
    // 8. Credentials
    {
      TableName: credentialsTableName,
      Item: {
        PK: { S: `KEYHASH#${credentialHash}` },
        orgId: { S: orgId },
        agentId: { S: agentId },
        status: { S: 'ACTIVE' }
      }
    }
  ];

  for (const req of items) {
    try {
      await ddb.send(new PutItemCommand(req));
      console.log(`Seeded ${req.TableName} / ${req.Item.PK.S} / ${req.Item.SK?.S || ''}`);
    } catch (e: any) {
      console.error(`Failed to seed ${req.TableName}:`, e);
    }
  }

  console.log('Seeding complete.');
}

seed().catch(console.error);
