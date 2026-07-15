import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../config/s3.config';
  
export async function getPresignedS3Url(key: string, expiresInSeconds = 172800 , bucketName :string): Promise<string> {
 
  console.log({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT,
    bucket: process.env.AWS_BUCKET_NAME,
    accessKeyLength: process.env.AWS_ACCESS_KEY?.length,
    secretKeyLength: process.env.AWS_SECRET_KEY?.length,
  });
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME_UNDEFINED:');
  }
 
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
 
  const url = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  return url;
}