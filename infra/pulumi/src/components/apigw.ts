import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { getResourceName } from "@bothandlers/config";

interface ApiGatewayComponentArgs {
    environment: string;
    apiFunction: aws.lambda.Function;
}

export class ApiGatewayComponent extends pulumi.ComponentResource {
    public readonly api: aws.apigatewayv2.Api;

    constructor(name: string, args: ApiGatewayComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("bothandlers:infrastructure:ApiGateway", name, args, opts);

        const { environment, apiFunction } = args;
        const apiName = getResourceName(environment, "api");

        this.api = new aws.apigatewayv2.Api(`${apiName}-gw`, {
            name: apiName,
            protocolType: "HTTP",
            tags: { Environment: environment }
        }, { parent: this });

        const integration = new aws.apigatewayv2.Integration(`${apiName}-integration`, {
            apiId: this.api.id,
            integrationType: "AWS_PROXY",
            integrationUri: apiFunction.arn,
            payloadFormatVersion: "2.0",
        }, { parent: this });

        new aws.apigatewayv2.Route(`${apiName}-route`, {
            apiId: this.api.id,
            routeKey: "$default",
            target: pulumi.interpolate`integrations/${integration.id}`,
        }, { parent: this });

        new aws.apigatewayv2.Stage(`${apiName}-stage`, {
            apiId: this.api.id,
            name: "$default",
            autoDeploy: true,
            tags: { Environment: environment }
        }, { parent: this });

        new aws.lambda.Permission(`${apiName}-lambda-permission`, {
            action: "lambda:InvokeFunction",
            function: apiFunction.name,
            principal: "apigateway.amazonaws.com",
            sourceArn: pulumi.interpolate`${this.api.executionArn}/*/*`,
        }, { parent: this });

        this.registerOutputs({ api: this.api });
    }
}
