import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const githubOrg = config.get("githubOrg") || "bothandlers";
const githubRepo = config.get("githubRepo") || "bothandlers";
const environments = ["dev", "staging", "production"];

// 1. Versioned, encrypted state bucket
const stateBucket = new aws.s3.Bucket("pulumi-state-bucket", {
    acl: "private",
    versioning: {
        enabled: true,
    },
    serverSideEncryptionConfiguration: {
        rule: {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "AES256",
            },
        },
    },
});

new aws.s3.BucketPublicAccessBlock("state-bucket-public-access", {
    bucket: stateBucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
});

// 2. KMS key per environment
const kmsKeys: Record<string, aws.kms.Key> = {};
environments.forEach((env) => {
    kmsKeys[env] = new aws.kms.Key(`kms-key-${env}`, {
        description: `KMS key for ${env} environment`,
        enableKeyRotation: true,
    });
});

// 3. GitHub OIDC Identity Provider
const githubProvider = new aws.iam.OpenIdConnectProvider("github-oidc", {
    url: "https://token.actions.githubusercontent.com",
    clientIdLists: ["sts.amazonaws.com"],
    thumbprintLists: ["1c58a3a8518e8759bf075b76b750d4f2df264fcd", "6938fd4d98bab03faadb97b34396831e3780aea1"], // GitHub standard thumbprints
});

// 4. One deploy role per environment
const deployRoles: Record<string, aws.iam.Role> = {};
environments.forEach((env) => {
    const role = new aws.iam.Role(`deploy-role-${env}`, {
        assumeRolePolicy: githubProvider.arn.apply(arn => JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Action: "sts:AssumeRoleWithWebIdentity",
                Effect: "Allow",
                Principal: { Federated: arn },
                Condition: {
                    StringEquals: {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                        "token.actions.githubusercontent.com:sub": `repo:${githubOrg}/${githubRepo}:environment:${env}`
                    }
                }
            }]
        }))
    });

    // Attach AdministratorAccess (or a broad but scoped policy) for deploying the environment
    new aws.iam.RolePolicyAttachment(`deploy-role-admin-${env}`, {
        role: role.name,
        policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
    });

    deployRoles[env] = role;
});

export const stateBucketName = stateBucket.id;
export const roleArns = Object.fromEntries(environments.map(env => [env, deployRoles[env].arn]));
export const keyArns = Object.fromEntries(environments.map(env => [env, kmsKeys[env].arn]));
