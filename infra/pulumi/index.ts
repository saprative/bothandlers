import * as pulumi from "@pulumi/pulumi";
import { DynamoDbComponent } from "./src/components/dynamo";
import { SqsComponent } from "./src/components/sqs";
import { SchedulerComponent } from "./src/components/scheduler";
import { LambdaComponent } from "./src/components/lambda";
import { AlarmsComponent } from "./src/components/alarms";

// Get stack environment name (e.g. dev, staging, production)
const environment = pulumi.getStack();

// 1. DynamoDB Tables
const dynamoDb = new DynamoDbComponent("dynamodb-tables", { environment });

// 2. SQS Queues
const sqs = new SqsComponent("sqs-queues", { environment });

// 3. Scheduler
const scheduler = new SchedulerComponent("scheduler", { environment });

// 4. Lambda Functions
const lambdas = new LambdaComponent("lambda-functions", {
    environment,
    queues: sqs.queues,
    tables: dynamoDb.tables
});

// 5. Cloudflare Worker IAM Credentials
const workerUser = new aws.iam.User("cloudflare-worker-user", {
    path: "/service-accounts/",
});

// Give worker access to queues and tables
new aws.iam.UserPolicyAttachment("worker-sqs-policy", {
    user: workerUser.name,
    policyArn: aws.iam.ManagedPolicy.AmazonSQSFullAccess, // Real deployment scopes this tightly
});
new aws.iam.UserPolicyAttachment("worker-dynamodb-policy", {
    user: workerUser.name,
    policyArn: aws.iam.ManagedPolicy.AmazonDynamoDBFullAccess, // Real deployment scopes this tightly
});

const workerAccessKey = new aws.iam.AccessKey("cloudflare-worker-key", {
    user: workerUser.name,
});

export const workerAccessKeyId = workerAccessKey.id;
export const workerSecretAccessKey = workerAccessKey.secret;

// 6. Alarms & Budgets
const alarms = new AlarmsComponent("cloudwatch-alarms", {
    environment,
    dlqs: sqs.dlqs,
    functions: lambdas.functions
});
