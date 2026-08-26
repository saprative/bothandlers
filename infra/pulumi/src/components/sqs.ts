import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Queues, getResourceName } from "@bothandlers/config";

interface SqsComponentArgs {
    environment: string;
}

export class SqsComponent extends pulumi.ComponentResource {
    public readonly queues: Record<string, aws.sqs.Queue> = {};
    public readonly dlqs: Record<string, aws.sqs.Queue> = {};

    constructor(name: string, args: SqsComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("bothandlers:infrastructure:Sqs", name, args, opts);

        const { environment } = args;

        for (const [key, def] of Object.entries(Queues)) {
            const queueName = getResourceName(environment, def.queueName);
            let dlq: aws.sqs.Queue | undefined;

            if (def.hasDlq) {
                const dlqName = `${queueName}-dlq`;
                dlq = new aws.sqs.Queue(`${dlqName}-queue`, {
                    name: dlqName,
                    messageRetentionSeconds: 1209600, // 14 days (max) for DLQ
                    tags: { Environment: environment }
                }, { parent: this });
                this.dlqs[key] = dlq;
            }

            const queueArgs: aws.sqs.QueueArgs = {
                name: queueName,
                visibilityTimeoutSeconds: def.visibilityTimeoutSeconds,
                tags: { Environment: environment }
            };

            if (dlq) {
                queueArgs.redrivePolicy = dlq.arn.apply(arn => JSON.stringify({
                    deadLetterTargetArn: arn,
                    maxReceiveCount: def.maxReceiveCount
                }));
            }

            this.queues[key] = new aws.sqs.Queue(`${queueName}-queue`, queueArgs, { parent: this });
        }
        
        this.registerOutputs({ queues: this.queues, dlqs: this.dlqs });
    }
}
