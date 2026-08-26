import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "@bothandlers/config";

interface AlarmsComponentArgs {
    environment: string;
    dlqs: Record<string, aws.sqs.Queue>;
    functions: Record<string, aws.lambda.Function>;
}

export class AlarmsComponent extends pulumi.ComponentResource {
    constructor(name: string, args: AlarmsComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("bothandlers:infrastructure:Alarms", name, args, opts);

        const { environment, dlqs, functions } = args;

        // Queue Alarms
        for (const [key, dlq] of Object.entries(dlqs)) {
            new aws.cloudwatch.MetricAlarm(`${key}-dlq-depth`, {
                alarmName: getResourceName(environment, `${key}-dlq-depth`),
                comparisonOperator: "GreaterThanThreshold",
                evaluationPeriods: 1,
                metricName: "ApproximateNumberOfMessagesVisible",
                namespace: "AWS/SQS",
                period: 60,
                statistic: "Sum",
                threshold: 0, // Alarm if any message goes to DLQ
                dimensions: { QueueName: dlq.name },
                tags: { Environment: environment }
            }, { parent: this });

            new aws.cloudwatch.MetricAlarm(`${key}-dlq-age`, {
                alarmName: getResourceName(environment, `${key}-dlq-oldest-message`),
                comparisonOperator: "GreaterThanThreshold",
                evaluationPeriods: 1,
                metricName: "ApproximateAgeOfOldestMessage",
                namespace: "AWS/SQS",
                period: 60,
                statistic: "Maximum",
                threshold: 300, // Alarm if older than 5 mins
                dimensions: { QueueName: dlq.name },
                tags: { Environment: environment }
            }, { parent: this });
        }

        // Function Alarms
        for (const [key, func] of Object.entries(functions)) {
            new aws.cloudwatch.MetricAlarm(`${key}-errors`, {
                alarmName: getResourceName(environment, `${key}-errors`),
                comparisonOperator: "GreaterThanThreshold",
                evaluationPeriods: 1,
                metricName: "Errors",
                namespace: "AWS/Lambda",
                period: 60,
                statistic: "Sum",
                threshold: 0,
                dimensions: { FunctionName: func.name },
                tags: { Environment: environment }
            }, { parent: this });
        }

        // 4.9 Per-environment budget with a spend alarm
        new aws.budgets.Budget(`${environment}-budget`, {
            name: getResourceName(environment, "budget"),
            budgetType: "COST",
            limitAmount: "20.0", // $20/mo limit for dev/staging, increase in prod
            limitUnit: "USD",
            timeUnit: "MONTHLY",
        }, { parent: this });

        this.registerOutputs({});
    }
}
