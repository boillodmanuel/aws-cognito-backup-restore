import { UsernameExistsException } from "@aws-sdk/client-cognito-identity-provider";
import { ApiLimiter } from "./common/ApiLimiter";
import { CognitoBackupData, printBackupDataStatistics } from "./common/common";
import * as config from "./restore.config";
import { CognitoService } from "./services/cognito.service";
import { S3Service } from "./services/s3.service";

export const cognitoService = new CognitoService(
  config.region,
  config.restoreTargetUserPoolId
);
export const s3Service = new S3Service(config.region, config.backupBucketName);
const apiLimiter = new ApiLimiter(10);

export async function restore(): Promise<void> {
  console.log(`Restore backup data from: ${config.backupFilePath}`);
  const backupData = await getCognitoBackupDataFromS3(config.backupFilePath);
  printBackupDataStatistics(backupData);

  await restoreUsers(backupData);

  // DO NOT RESTORE GROUPS AS IT SHOULD BE CREATED BY INFRA AS CODE

  await restoreUsersInGroups(backupData);

  console.log("Restore done");
}

async function restoreUsers(backupData: CognitoBackupData) {
  for (const user of backupData.users) {
    console.log(`Restore user: ${user.Username}`);
    await apiLimiter.checkApiLimit();

    try {
      await cognitoService.createUser(user);
    } catch (error) {
      if (error instanceof UsernameExistsException) {
        console.log(`WARN: user ${user.Username} already exists`);
      } else {
        throw error;
      }
    }
  }
}

async function restoreUsersInGroups(backupData: CognitoBackupData) {
  for (const [groupName, usernames] of Object.entries(
    backupData.groupDetails
  )) {
    await restoreUsersInGroup(groupName, usernames);
  }
}
async function restoreUsersInGroup(groupName: string, usernames: string[]) {
  console.log(`Restore users in group: ${groupName}`);

  await apiLimiter.checkApiLimit();
  try {
    await cognitoService.getGroup(groupName);
  } catch (error) {
    console.log(
      `ERROR: Group ${groupName} does not exist. It should have been created by infra as code`
    );
    throw error;
  }

  for (const username of usernames) {
    console.log(`Add user: ${username}`);
    await apiLimiter.checkApiLimit();
    await cognitoService.addUserToGroup(username, groupName);
  }
}

async function getCognitoBackupDataFromS3(filePath: string) {
  const file = await s3Service.download(filePath);
  if (!file.Body) {
    throw new Error("No file content");
  }
  const content = await file.Body.transformToString();
  const backupData = JSON.parse(content) as CognitoBackupData;
  return backupData;
}
