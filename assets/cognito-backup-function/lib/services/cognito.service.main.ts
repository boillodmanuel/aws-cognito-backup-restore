import { CognitoService } from "./cognito.service";
import * as config from "../backup.config";

(async () => {
  const cognitoService = new CognitoService(
    config.region,
    config.backupUserPoolId
  );
  const users = await cognitoService.listUsers();
  console.log("listUser:", JSON.stringify(users));

  const groups = await cognitoService.listGroups();
  console.log("listGroups:", groups);

  const usersInGroup = await cognitoService.listUsersInGroup("admins");
  console.log("listUsersInGroup:", usersInGroup);
})();
