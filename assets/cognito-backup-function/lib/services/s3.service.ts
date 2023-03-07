import {
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";

export class S3Service {
  private readonly bucketName: string;
  private readonly client: S3Client;

  constructor(region: string, bucketName: string) {
    this.bucketName = bucketName;
    this.client = new S3Client({ region });
  }

  async upload(filePath: string, body: string, contentType: string) {
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: filePath,
      Body: body,
      ContentType: contentType,
      ContentEncoding: "UTF-8",
    };
    const data = await this.client.send(new PutObjectCommand(params));

    return data;
  }

  async download(filePath: string) {
    const params: GetObjectCommandInput = {
      Bucket: this.bucketName,
      Key: filePath,
    };
    const data = await this.client.send(new GetObjectCommand(params));

    return data;
  }
}
