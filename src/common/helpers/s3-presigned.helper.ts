import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../config/s3.config';
  
export async function getPresignedS3Url(key: string, expiresInSeconds = 172800 , bucketName :string): Promise<string> {
 
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