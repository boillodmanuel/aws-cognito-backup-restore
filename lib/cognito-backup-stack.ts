import { Aws, CfnOutput, Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib'
import { AccountRecovery, CfnUserPoolGroup, Mfa, UserPool } from 'aws-cdk-lib/aws-cognito'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { Key } from 'aws-cdk-lib/aws-kms'
import { Architecture, Function, LambdaInsightsVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'
import { join } from 'path'

interface CognitoBackupStackProps extends StackProps {
  stackTags?: { [key: string]: string }
}

export class CognitoBackupStack extends Stack {
  readonly props: CognitoBackupStackProps
  readonly key: Key
  readonly userPool: UserPool
  readonly backupBucket: Bucket
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly cognitoBackupFunction: Function

  constructor(scope: Construct, id: string, props?: CognitoBackupStackProps) {
    super(scope, id, props)

    this.props = props || {}

    this.key = this.createKmsKey()

    this.userPool = this.createUserPoolAndGroups()

    this.backupBucket = this.createBackupBucket()

    this.createLifecycleRuleForCognitoBackupBucket()

    this.cognitoBackupFunction = this.createCognitoBackupFunction()

    this.createCognitoBackupDailySchedule()

    new CfnOutput(this, 'backup-bucket-name', {
      value: this.backupBucket.bucketName,
    })

    new CfnOutput(this, 'user-pool-id', {
      value: this.userPool.userPoolId,
    })
  }

  createKmsKey() {
    const key = new Key(this, 'key', {
      enableKeyRotation: true,
      pendingWindow: Duration.days(7),
      removalPolicy: RemovalPolicy.RETAIN,
    })

    return key
  }

  createUserPoolAndGroups() {
    const userPool = new UserPool(this, 'userpool', {
      removalPolicy: RemovalPolicy.RETAIN,
      deletionProtection: true,
      accountRecovery: AccountRecovery.NONE,
      mfa: Mfa.OFF,
    })

    // We must manually add tags on UserPool (see https://github.com/aws/aws-cdk/issues/14127)
    Object.entries(this.props.stackTags || {}).forEach(([key, value]) => Tags.of(userPool).add(key, value))

    new CfnUserPoolGroup(this, 'userpool-users-group', {
      userPoolId: userPool.userPoolId,
      groupName: 'users',
    })

    new CfnUserPoolGroup(this, 'userpool-admins-group', {
      userPoolId: userPool.userPoolId,
      groupName: 'admins',
    })

    return userPool
  }

  createBackupBucket() {
    const backupBucket = new Bucket(this, 'backup-bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryptionKey: this.key,
      bucketKeyEnabled: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    })

    return backupBucket
  }

  createLifecycleRuleForCognitoBackupBucket() {
    this.backupBucket.addLifecycleRule({
      id: 'clean-cognito-daily-backup-after-30-days-rule',
      expiration: Duration.days(30),
      noncurrentVersionsToRetain: 0,
      prefix: 'Cognito/DailyBackup/',
    })

    this.backupBucket.addLifecycleRule({
      id: 'clean-cognito-monthly-backup-after-1-year-rule',
      expiration: Duration.days(366),
      noncurrentVersionsToRetain: 0,
      prefix: 'Cognito/MonthlyBackup/',
    })
  }

  createCognitoBackupFunction() {
    const cognitoBackupFunction = new NodejsFunction(this, 'cognito-backup-function', {
      runtime: Runtime.NODEJS_18_X,
      entry: join(__dirname, '../assets/cognito-backup-function/index.ts'),
      architecture: Architecture.ARM_64,
      bundling: {
        minify: false,
        sourceMap: true,
      },
      environmentEncryption: this.key,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        BACKUP_USER_POOL_ID: this.userPool.userPoolId,
        BACKUP_BUCKET_NAME: this.backupBucket.bucketName,
        REGION: Aws.REGION,
      },
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      timeout: Duration.seconds(30),
    })

    if (!cognitoBackupFunction.role) {
      throw new Error('Unexpected error: property lambda.role should exist')
    }

    this.userPool.grant(
      cognitoBackupFunction.role,
      'cognito-idp:ListUsers',
      'cognito-idp:ListGroups',
      'cognito-idp:ListUsersInGroup',
    )

    // Give permission to write to S3 'Cognito/' prefix only
    this.backupBucket.grantReadWrite(cognitoBackupFunction, 'Cognito/*')

    return cognitoBackupFunction
  }

  createCognitoBackupDailySchedule() {
    const dlq = new Queue(this, 'cognito-backup-dead-letter-queue')

    // WARN: tags on Rule are not supported yet: https://github.com/aws/aws-cdk/issues/4907
    const rule = new Rule(this, 'cognito-backup-daily-schedule', {
      schedule: Schedule.rate(Duration.days(1)),
    })

    rule.addTarget(
      new LambdaFunction(this.cognitoBackupFunction, {
        deadLetterQueue: dlq,
      }),
    )
  }
}
