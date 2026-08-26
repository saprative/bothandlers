import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Tables, getResourceName } from "@bothandlers/config";

interface DynamoDbComponentArgs {
    environment: string;
}

export class DynamoDbComponent extends pulumi.ComponentResource {
    public readonly tables: Record<string, aws.dynamodb.Table> = {};

    constructor(name: string, args: DynamoDbComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("bothandlers:infrastructure:DynamoDb", name, args, opts);

        const { environment } = args;

        for (const [key, def] of Object.entries(Tables)) {
            const tableName = getResourceName(environment, def.tableName);
            
            const attributes: aws.types.input.dynamodb.TableAttribute[] = [
                { name: def.partitionKey.name, type: def.partitionKey.type },
            ];
            
            if (def.sortKey) {
                attributes.push({ name: def.sortKey.name, type: def.sortKey.type });
            }
            
            const globalSecondaryIndexes: aws.types.input.dynamodb.TableGlobalSecondaryIndex[] = [];
            if (def.globalSecondaryIndexes) {
                for (const gsi of def.globalSecondaryIndexes) {
                    if (!attributes.find(a => a.name === gsi.partitionKey.name)) {
                        attributes.push({ name: gsi.partitionKey.name, type: gsi.partitionKey.type });
                    }
                    if (gsi.sortKey && !attributes.find(a => a.name === gsi.sortKey.name)) {
                        attributes.push({ name: gsi.sortKey.name, type: gsi.sortKey.type });
                    }
                    globalSecondaryIndexes.push({
                        name: gsi.indexName,
                        hashKey: gsi.partitionKey.name,
                        rangeKey: gsi.sortKey?.name,
                        projectionType: gsi.projectionType,
                    });
                }
            }

            const isProd = environment === "production";

            this.tables[key] = new aws.dynamodb.Table(`${tableName}-table`, {
                name: tableName,
                attributes,
                hashKey: def.partitionKey.name,
                rangeKey: def.sortKey?.name,
                globalSecondaryIndexes: globalSecondaryIndexes.length > 0 ? globalSecondaryIndexes : undefined,
                billingMode: "PAY_PER_REQUEST", // Serverless billing
                pointInTimeRecovery: {
                    enabled: true, // Always enabled as per 4.1
                },
                ttl: def.ttlAttribute ? { attributeName: def.ttlAttribute, enabled: true } : undefined,
                tags: { Environment: environment }
            }, { parent: this });
        }
        
        this.registerOutputs({ tables: this.tables });
    }
}
