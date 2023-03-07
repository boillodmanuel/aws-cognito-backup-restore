# Cognito Backup

For an overview, refer to the repository [README.md](../../README.md). 

## Manual testing

To execute the backup manually:

With bash:
```powershell
export REGION="<TODO>"
export BACKUP_BUCKET_NAME="<TODO>"
export BACKUP_USER_POOL_ID="<TODO>"

npm install

# Load users
npx ts-node ./tests/loadUsers.main.ts

# Create backup
npx ts-node ./main/backup.main.ts
```

With Powershell:
```powershell
$env:REGION="<TODO>"
$env:BACKUP_BUCKET_NAME="<TODO>"
$env:BACKUP_USER_POOL_ID="<TODO>"

npm install

# Load users
npx ts-node .\tests\loadUsers.main.ts

# Create backup
npx ts-node .\main\backup.main.ts
```

# Cognito Restoration

The restoration is manual.

Process:
1. Create a new Cognito User Pool with infrastructure as code (this must create groups also)
2. Restore the backup file to the new user pool with the following command:

With bash:
```bash
export REGION="<TODO>"
export BACKUP_BUCKET_NAME="<TODO>"
export BACKUP_FILE_PATH="<TODO>"
export RESTORE_TARGET_USER_POOL_ID="<TODO>"

npm install

npx ts-node ./main/restore.main.ts
```

With Powershell:
```powershell
$env:REGION="<TODO>"
$env:BACKUP_BUCKET_NAME="<TODO>"
$env:BACKUP_FILE_PATH="<TODO>"
$env:RESTORE_TARGET_USER_POOL_ID="<TODO>"

npm install

npx ts-node .\main\restore.main.ts
```

# Development

## Manual testing of services

To run cognito service manually:

With bash:
```powershell
export REGION="<TODO>"
export BACKUP_BUCKET_NAME="<TODO>"
export BACKUP_USER_POOL_ID="<TODO>"

npm install

npx ts-node ./lib/services/cognito.service.main.ts
```


With Powershell:
```powershell
$env:REGION="<TODO>"
$env:BACKUP_BUCKET_NAME="<TODO>"
$env:BACKUP_USER_POOL_ID="<TODO>"

npm install

npx ts-node .\lib\services\cognito.service.main.ts
```

# Documentation

- [Amazon Cognito User Pools - API Reference](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/Welcome.html)
- [Amazon Cognito Identity Provider examples using SDK for JavaScript V3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_cognito-identity-provider_code_examples.html)
- Cognito User Profiles Export Reference Architecture:
  - [Main page](https://aws.amazon.com/solutions/implementations/cognito-user-profiles-export-reference-architecture/)
  - [Source code](https://github.com/aws-solutions/cognito-user-profiles-export-reference-architecture/)
- [NPM package cognito-backup-restore](https://github.com/rahulpsd18/cognito-backup-restore/)
