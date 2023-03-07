/**
 * Returns a promise to be used as a sleep function. The values for sleepTimeInSeconds will be added to the value for sleepTimeInMS
 */
async function sleep(sleepTimeInMS = 0): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, sleepTimeInMS));
}

export class ApiLimiter {
  private readonly apiCallPerSecondLimit: number;
  private apiCallCount = 0;
  private currentTime: number;
  private oneSecondFromNow: number;

  constructor(apiCallPerSecondLimit = 10) {
    this.apiCallPerSecondLimit = apiCallPerSecondLimit;
    this.currentTime = new Date().getTime();
    this.oneSecondFromNow = this.currentTime + 1000;
  }

  async checkApiLimit() {
    if (this.apiCallCount >= this.apiCallPerSecondLimit) {
      const waitTime = this.oneSecondFromNow - this.currentTime + 1;
      console.log(
        `API limit: api call per second limit (${
          this.apiCallPerSecondLimit
        }) reached. Waiting for ${
          this.oneSecondFromNow - this.currentTime
        }ms before proceeding`
      );
      await sleep(waitTime);
    }
    this.currentTime = new Date().getTime();
    if (
      this.apiCallCount >= this.apiCallPerSecondLimit ||
      this.currentTime >= this.oneSecondFromNow
    ) {
      // Reset oneSecondFromNow and apiCallCount
      // console.log("Resetting api call per second timer and API call count");
      this.oneSecondFromNow = this.currentTime + 1000;
      this.apiCallCount = 0;
    }

    this.apiCallCount++;
  }
}
