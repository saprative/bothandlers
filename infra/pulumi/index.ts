import * as pulumi from "@pulumi/pulumi";
import { DynamoDbComponent } from "./src/components/dynamo";
import { SqsComponent } from "./src/components/sqs";
import { SchedulerComponent } from "./src/components/scheduler";
import { LambdaComponent } from "./src/components/lambda";
import { ApiGatewayComponent } from "./src/components/apigw";
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

// 5. API Gateway
const apiGateway = new ApiGatewayComponent("api-gateway", {
    environment,
    apiFunction: lambdas.functions["api"]
});

// 6. Alarms & Budgets
const alarms = new AlarmsComponent("cloudwatch-alarms", {
    environment,
    dlqs: sqs.dlqs,
    functions: lambdas.functions
});

export const apiUrl = apiGateway.api.apiEndpoint;
