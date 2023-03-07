import * as config from "../lib/backup.config";
import { CognitoService } from "../lib/services/cognito.service";
import { ApiLimiter } from "../lib/common/ApiLimiter";


export const cognitoService = new CognitoService(
  config.region,
  config.backupUserPoolId
);
const apiLimiter = new ApiLimiter(10);

function generateUserNames(
  userNamePrefix: string,
  userNumber: number,
) {
  const userNames = []

  for (let i = 1; i <= userNumber; i++) {
    userNames.push(`${userNamePrefix}${i}`);
  }
  return userNames
}

async function createUsers(userNames: string[]) {
  for (const userName of userNames) {
    console.log(`Creating user: ${userName}`);
    await apiLimiter.checkApiLimit();
    await cognitoService.createUser({ Username: userName });
  }
}

async function addUsersInGroup(
  userNames: string[],
  groupName: string) {

  for (const userName of userNames) {
    console.log(`Adding user ${userName} to group: ${groupName}`);
    await apiLimiter.checkApiLimit();
    await cognitoService.addUserToGroup(userName, groupName);
  }
}


(async () => {
  const userNames = generateUserNames("user_", 100)
  await createUsers(userNames)
  await addUsersInGroup(userNames.slice(0, 50), "users")
  await addUsersInGroup(userNames.slice(50, 100), "admins")
})();
