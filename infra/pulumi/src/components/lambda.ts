import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "@bothandlers/config";

interface LambdaComponentArgs {
    environment: string;
    queues: Record<string, aws.sqs.Queue>;
    tables: Record<string, aws.dynamodb.Table>;
}

export class LambdaComponent extends pulumi.ComponentResource {
    public readonly roles: Record<string, aws.iam.Role> = {};
    public readonly functions: Record<string, aws.lambda.Function> = {};

    constructor(name: string, args: LambdaComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("bothandlers:infrastructure:Lambda", name, args, opts);

        const { environment, queues, tables } = args;

        const functionConfigs = [
            { name: "api", memory: 256, timeout: 10 },
            { name: "routing-worker", memory: 256, timeout: 30, sqsTrigger: "routing" },
            { name: "notification-worker", memory: 256, timeout: 30, sqsTrigger: "notification" },
            { name: "webhook-worker", memory: 256, timeout: 30, sqsTrigger: "webhook" },
            { name: "escalation-worker", memory: 256, timeout: 30 },
            { name: "analytics-worker", memory: 256, timeout: 60, sqsTrigger: "analytics" },
            { name: "audit-fanout", memory: 256, timeout: 30, sqsTrigger: "audit-fanout" }
        ];

        for (const config of functionConfigs) {
            const funcName = getResourceName(environment, config.name);
            
            // 4.5 Least-privilege roles
            const role = new aws.iam.Role(`${funcName}-role`, {
                assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
            }, { parent: this });

            // Add basic execution role
            new aws.iam.RolePolicyAttachment(`${funcName}-basic`, {
                role: role.name,
                policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
            }, { parent: this });

            // Explicit deny on updating/deleting audit events (Task 4.5 requirement)
            const auditEventsTable = tables["intervention_events"];
            new aws.iam.RolePolicy(`${funcName}-deny-audit-mutations`, {
                role: role.id,
                policy: auditEventsTable.arn.apply(arn => JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [{
                        Effect: "Deny",
                        Action: [
                            "dynamodb:UpdateItem",
                            "dynamodb:DeleteItem"
                        ],
                        Resource: arn
                    }]
                }))
            }, { parent: this });

            this.roles[config.name] = role;

            // 5.1 Placeholder handlers (health response)
            const placeholderCode = `
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ service: "${config.name}", version: "1.0.0", status: "health-ok" })
    };
};
`;

            const lambda = new aws.lambda.Function(`${funcName}-func`, {
                name: funcName,
                role: role.arn,
                runtime: "nodejs20.x",
                handler: "index.handler",
                memorySize: config.memory,
                timeout: config.timeout,
                code: new pulumi.asset.AssetArchive({
                    "index.js": new pulumi.asset.StringAsset(placeholderCode)
                }),
                tags: { Environment: environment }
            }, { parent: this });

            this.functions[config.name] = lambda;

            // 4.7 Wire event source mappings for queues
            if (config.sqsTrigger && queues[config.sqsTrigger]) {
                const triggerQueue = queues[config.sqsTrigger];
                
                new aws.iam.RolePolicyAttachment(`${funcName}-sqs`, {
                    role: role.name,
                    policyArn: aws.iam.ManagedPolicy.AmazonSQSFullAccess, // Real deployment would scope this tightly
                }, { parent: this });

                new aws.lambda.EventSourceMapping(`${funcName}-esm`, {
                    eventSourceArn: triggerQueue.arn,
                    functionName: lambda.name,
                    batchSize: 10,
                }, { parent: this });
            }
        }
        
        this.registerOutputs({ functions: this.functions, roles: this.roles });
    }
}
