import {
  CognitoBackupData,
  CognitoBackupGroupData,
  removeUndefined,
  printBackupDataStatistics,
} from "./common/common";
import * as config from "./backup.config";
import { CognitoService } from "./services/cognito.service";
import { S3Service } from "./services/s3.service";

export const cognitoService = new CognitoService(
  config.region,
  config.backupUserPoolId
);
export const s3Service = new S3Service(config.region, config.backupBucketName);

export async function backup(): Promise<void> {
  const date = new Date();
  const dailySuffix = date.toISOString().substring(0, 10);
  const monthlySuffix = date.toISOString().substring(0, 7);

  console.log("Extract data from cognito");
  const cognitoData = await getCognitoData();
  printBackupDataStatistics(cognitoData);
  const dailyPath = `Cognito/DailyBackup/${dailySuffix}.json`;
  const monthlyPath = `Cognito/MonthlyBackup/${monthlySuffix}.json`;

  await s3Service.upload(
    dailyPath,
    JSON.stringify(cognitoData),
    "application/json"
  );
  await s3Service.upload(
    monthlyPath,
    JSON.stringify(cognitoData),
    "application/json"
  );

  console.log(`Cognito daily backup uploaded to: ${dailyPath}`);
  console.log(`Cognito monthly backup uploaded to: ${monthlyPath}`);
  console.log("Backup done");
}

export async function getCognitoData(): Promise<CognitoBackupData> {
  const users = await cognitoService.listUsers();
  const groups = await cognitoService.listGroups();

  const groupDetails: CognitoBackupGroupData = {};

  for (const group of groups) {
    if (group.GroupName) {
      const groupName = group.GroupName;
      const usersInGroup = await cognitoService.listUsersInGroup(groupName);
      groupDetails[groupName] = usersInGroup
        .map((user) => user.Username)
        .filter(removeUndefined);
    }
  }

  return {
    users,
    groupDetails,
  };
}
