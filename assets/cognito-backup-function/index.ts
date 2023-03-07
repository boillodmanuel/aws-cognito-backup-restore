import { APIGatewayEvent, Context } from "aws-lambda";
import { backup } from "./lib/backup";

export const handler = async (
  event: APIGatewayEvent,
  _context?: Context
): Promise<void> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  console.log("Start cognito backup");
  await backup();
  console.log("End cognito backup");
};
