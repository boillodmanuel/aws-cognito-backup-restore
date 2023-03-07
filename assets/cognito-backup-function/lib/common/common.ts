import { UserType } from "@aws-sdk/client-cognito-identity-provider";

export function getEnvVariable(
  envName: string,
  defaultValue = undefined
): string | undefined {
  return process.env[envName] || defaultValue;
}

export function requiredEnvVariable(envName: string): string {
  const value = getEnvVariable(envName);
  if (!value) {
    throw new Error(`Env variable '${envName}' is not set`);
  }
  return value;
}

export const removeUndefined = <S>(value: S | undefined): value is S =>
  value !== undefined;

export type CognitoBackupGroupData = { [groupName: string]: string[] };
export interface CognitoBackupData {
  users: UserType[];
  groupDetails: CognitoBackupGroupData;
}

export function printBackupDataStatistics(cognitoData: CognitoBackupData) {
  console.log(`Backup data statistics:`);
  console.log(`- users: ${cognitoData.users.length}`);
  console.log(`- groups: ${Object.keys(cognitoData.groupDetails).length}`);
}
