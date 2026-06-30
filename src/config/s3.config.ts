
import * as dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
dotenv.config();

export const S3_BUCKET = process.env.AWS_BUCKET_NAME;
console.log("S3_BUCKET==>",S3_BUCKET)
export const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
    endpoint: process.env.AWS_ENDPOINT, 
    forcePathStyle: true, 
});


export const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
});
