import { requiredEnvVariable } from "./common/common";

export const region = requiredEnvVariable("REGION");
export const backupBucketName = requiredEnvVariable("BACKUP_BUCKET_NAME");
export const backupUserPoolId = requiredEnvVariable("BACKUP_USER_POOL_ID");

console.log("Backup Configuration:");
console.log("- region", region);
console.log("- backupBucketName", backupBucketName);
console.log("- backupUserPoolId", backupUserPoolId);
