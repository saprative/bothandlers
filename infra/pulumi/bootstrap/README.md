# Bootstrap Infrastructure

This stack creates the foundational infrastructure required for deploying the application. This is a **one-time privileged step** per AWS account, and must be applied by an operator with elevated credentials (e.g. AdministratorAccess).

## What it creates:
1. A versioned, encrypted state bucket for Pulumi to store the infrastructure state for `dev`, `staging`, and `production`.
2. A KMS key per environment for encryption of environment-specific resources.
3. The GitHub OIDC Identity Provider to allow GitHub Actions to assume roles without static credentials.
4. One deploy role per environment (`dev`, `staging`, `production`), with trust policies restricted to the exact GitHub repository and GitHub Environment.

## How to Apply (First Time)

Since the state bucket does not exist yet, the first apply uses local state. After creation, we migrate the state into the newly created bucket.

```bash
# 1. Login locally
pulumi login --local

# 2. Initialize and deploy
pulumi stack init bootstrap
pulumi up -y

# 3. Get the created bucket name
BUCKET_NAME=$(pulumi stack output stateBucketName)

# 4. Migrate state to the new bucket
pulumi login s3://${BUCKET_NAME}
# Note: You may need to copy the local state file to S3, or simply let subsequent deployments use the S3 backend.
```

## How to Re-Run (For a New Account)

If you are setting up a completely new AWS account (e.g. splitting production into its own account as described in the architecture documents), you repeat this exact process in the new account with elevated credentials for that account.

## Security Constraints

The deploy roles created here contain full subject claims, matching `repo:organization/repo:environment:envName`. A role cannot be assumed from outside the repository or from the wrong environment pipeline.
