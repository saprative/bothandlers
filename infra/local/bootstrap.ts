import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { SQSClient, CreateQueueCommand } from '@aws-sdk/client-sqs';
import { SchedulerClient, CreateScheduleGroupCommand } from '@aws-sdk/client-scheduler';
import { Tables, Queues, SchedulerGroups, getResourceName } from '@bothandlers/config';

const ENV = 'local';
const REGION = 'us-east-1';
const ENDPOINT = process.env.AWS_ENDPOINT_URL || 'http://localhost:4566';

const ddb = new DynamoDBClient({ region: REGION, endpoint: ENDPOINT, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });
const sqs = new SQSClient({ region: REGION, endpoint: ENDPOINT, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });
const scheduler = new SchedulerClient({ region: REGION, endpoint: ENDPOINT, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });

async function bootstrap() {
  console.log(`Bootstrapping local environment (${ENDPOINT})...`);

  for (const [key, def] of Object.entries(Tables)) {
    const tableName = getResourceName(ENV, def.tableName);
    console.log(`Creating DynamoDB table: ${tableName}`);
    try {
      const keySchema = [{ AttributeName: def.partitionKey.name, KeyType: 'HASH' }];
      const attributeDefinitions = [{ AttributeName: def.partitionKey.name, AttributeType: def.partitionKey.type }];

      if (def.sortKey) {
        keySchema.push({ AttributeName: def.sortKey.name, KeyType: 'RANGE' });
        attributeDefinitions.push({ AttributeName: def.sortKey.name, AttributeType: def.sortKey.type });
      }

      const globalSecondaryIndexes = def.globalSecondaryIndexes?.map(gsi => {
        const gsiKeySchema = [{ AttributeName: gsi.partitionKey.name, KeyType: 'HASH' }];
        const existingAttr = attributeDefinitions.find(a => a.AttributeName === gsi.partitionKey.name);
        if (!existingAttr) {
          attributeDefinitions.push({ AttributeName: gsi.partitionKey.name, AttributeType: gsi.partitionKey.type });
        }
        
        if (gsi.sortKey) {
          gsiKeySchema.push({ AttributeName: gsi.sortKey.name, KeyType: 'RANGE' });
          const existingSk = attributeDefinitions.find(a => a.AttributeName === gsi.sortKey.name);
          if (!existingSk) {
            attributeDefinitions.push({ AttributeName: gsi.sortKey.name, AttributeType: gsi.sortKey.type });
          }
        }

        return {
          IndexName: gsi.indexName,
          KeySchema: gsiKeySchema,
          Projection: { ProjectionType: gsi.projectionType },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        };
      });

      await ddb.send(new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchema,
        GlobalSecondaryIndexes: globalSecondaryIndexes?.length ? globalSecondaryIndexes : undefined,
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }));
      console.log(`Created table ${tableName}`);
    } catch (e: any) {
      if (e.name !== 'ResourceInUseException') {
        console.error(`Failed to create table ${tableName}:`, e);
      } else {
        console.log(`Table ${tableName} already exists.`);
      }
    }
  }

  for (const [key, def] of Object.entries(Queues)) {
    const queueName = getResourceName(ENV, def.queueName);
    const dlqName = `${queueName}-dlq`;
    
    let dlqArn = '';
    if (def.hasDlq) {
      console.log(`Creating SQS DLQ: ${dlqName}`);
      try {
        const dlqRes = await sqs.send(new CreateQueueCommand({ QueueName: dlqName }));
        dlqArn = `arn:aws:sqs:${REGION}:000000000000:${dlqName}`;
        console.log(`Created DLQ ${dlqName}`);
      } catch (e: any) {
         console.error(`Failed to create DLQ ${dlqName}:`, e);
      }
    }

    console.log(`Creating SQS Queue: ${queueName}`);
    try {
      const attributes: Record<string, string> = {
        VisibilityTimeout: def.visibilityTimeoutSeconds.toString()
      };
      if (dlqArn) {
        attributes.RedrivePolicy = JSON.stringify({
          deadLetterTargetArn: dlqArn,
          maxReceiveCount: def.maxReceiveCount.toString()
        });
      }
      await sqs.send(new CreateQueueCommand({
        QueueName: queueName,
        Attributes: attributes
      }));
      console.log(`Created queue ${queueName}`);
    } catch (e: any) {
      console.error(`Failed to create queue ${queueName}:`, e);
    }
  }

  for (const [key, groupName] of Object.entries(SchedulerGroups)) {
    const name = getResourceName(ENV, groupName);
    console.log(`Creating Scheduler Group: ${name}`);
    try {
      await scheduler.send(new CreateScheduleGroupCommand({ Name: name }));
      console.log(`Created group ${name}`);
    } catch (e: any) {
      if (e.name !== 'ConflictException') {
        console.error(`Failed to create scheduler group ${name}:`, e);
      } else {
        console.log(`Scheduler group ${name} already exists.`);
      }
    }
  }

  console.log('Bootstrap complete.');
}

bootstrap().catch(console.error);
