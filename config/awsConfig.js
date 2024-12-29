import { S3Client } from '@aws-sdk/client-s3';

// Create an S3 client

export const s3Client = new S3Client({
    region: process.env.APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY
    }
});

