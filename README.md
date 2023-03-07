# Cognito Backup

## Functional Overview

The Cognito backup extracts users and groups from cognito and copy it into a s3 bucket.
It runs everyday and create a daily and monthly backup.

Backup details:
- daily exports are kept for 30 days. Filename: `Cognito/DailyBackup/YYYY-MM-DD.json`
- monthly exports are kept for 1 year. Filename: `Cognito/MonthlyBackup/YYYY-DD.json`


## Technical overview

- The backup is done by the `cognito-backup-function` lambda function
- An EventBridge rule, scheduled every day, triggers the lambda function
- The function extracts data (users and groups) from the cognito user pool and upload it into the S3 bucket


## Installation

Pre-requisites:
- `npm` installed
- `AWS CDK` installed

Deploy resources
```bash
npm install
cdk deploy
```

## Clean up


To clean-up resources
```bash
npm install
cdk destroy
```

Due to `removalPolicy`, somes resources are not deleted. Check cloud formation or source code ([lib/cognito-backup-stack.ts](./lib/cognito-backup-stack.ts)) to get the details.

# Cognito Restoration

The restoration is manual.

See corresponding documentation in [the function README](./assets/cognito-backup-function/README.md).
