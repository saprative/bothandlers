import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { SchedulerGroups, getResourceName } from "@bothandlers/config";

interface SchedulerComponentArgs {
    environment: string;
}

export class SchedulerComponent extends pulumi.ComponentResource {
    public readonly groups: Record<string, aws.scheduler.ScheduleGroup> = {};

    constructor(name: string, args: SchedulerComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("bothandlers:infrastructure:Scheduler", name, args, opts);

        const { environment } = args;

        for (const [key, groupName] of Object.entries(SchedulerGroups)) {
            const name = getResourceName(environment, groupName);
            this.groups[key] = new aws.scheduler.ScheduleGroup(`${name}-group`, {
                name: name,
                tags: { Environment: environment }
            }, { parent: this });
        }
        
        this.registerOutputs({ groups: this.groups });
    }
}
