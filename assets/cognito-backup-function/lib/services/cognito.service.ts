import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  GetGroupCommand,
  ListGroupsCommand,
  ListUsersCommand,
  ListUsersInGroupCommand,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";

export class CognitoService {
  private readonly userPoolId: string;
  private readonly client: CognitoIdentityProviderClient;

  constructor(region: string, userPoolId: string) {
    this.userPoolId = userPoolId;
    this.client = new CognitoIdentityProviderClient({ region });
  }

  async listUsers() {
    const users = [];
    let paginationToken: string | undefined;
    let hasMoreUsers = true;

    while (hasMoreUsers) {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        PaginationToken: paginationToken,
        Limit: 60, // current maximum. See https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListUsers.html
      });
      const listUsersResponse = await this.client.send(command);
      paginationToken = listUsersResponse.PaginationToken;
      hasMoreUsers = paginationToken !== undefined;
      if (listUsersResponse.Users) {
        users.push(...listUsersResponse.Users);
      }
    }
    return users;
  }

  async getGroup(groupName: string) {
    const command = new GetGroupCommand({
      UserPoolId: this.userPoolId,
      GroupName: groupName,
    });

    return this.client.send(command);
  }

  async listGroups() {
    const groups = [];
    let nextToken: string | undefined;
    let hasMoreGroups = true;

    while (hasMoreGroups) {
      const command = new ListGroupsCommand({
        UserPoolId: this.userPoolId,
        NextToken: nextToken,
        Limit: 60, // current maximum. See https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListGroups.html
      });
      const listGroupsResponse = await this.client.send(command);
      nextToken = listGroupsResponse.NextToken;
      hasMoreGroups = nextToken !== undefined;
      if (listGroupsResponse.Groups) {
        groups.push(...listGroupsResponse.Groups);
      }
    }
    return groups;
  }

  async listUsersInGroup(groupName: string) {
    const users = [];
    let nextToken: string | undefined;
    let hasMoreUsers = true;

    while (hasMoreUsers) {
      const command = new ListUsersInGroupCommand({
        UserPoolId: this.userPoolId,
        GroupName: groupName,
        NextToken: nextToken,
        Limit: 60, // current maximum. See https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListUsersInGroup.html
      });
      const listUsersInGroupResponse = await this.client.send(command);
      nextToken = listUsersInGroupResponse.NextToken;
      hasMoreUsers = nextToken !== undefined;
      if (listUsersInGroupResponse.Users) {
        users.push(...listUsersInGroupResponse.Users);
      }
    }
    return users;
  }

  async createUser(user: UserType) {
    // Remove read-only "sub" attribute
    const userAttributes = (user.Attributes || []).filter(
      (attr) => attr.Name !== "sub"
    );

    const command = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
      Username: user.Username,
      UserAttributes: userAttributes,
    });

    return this.client.send(command);
  }

  async createGroup(groupname: string) {
    const command = new CreateGroupCommand({
      UserPoolId: this.userPoolId,
      GroupName: groupname,
    });

    return this.client.send(command);
  }

  async addUserToGroup(username: string, groupname: string) {
    const command = new AdminAddUserToGroupCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      GroupName: groupname,
    });

    return this.client.send(command);
  }
}
