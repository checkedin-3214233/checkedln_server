import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const uploadImage = async (req, res) => {
    const file = req.file;
    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    // Upload file to S3
    const params = {
        Bucket: 'userallimages',
        ACL: 'public-read',
        ContentType: 'image/jpeg',
        Key: `${Date.now().toString()}-${file.originalname}`,
        Body: file.buffer
    };

    try {
        await s3Client.send(new PutObjectCommand(params)).then((data) => {

            console.log(data);
        });
        const url = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;



        res.send({ data: url, "message": 'File uploaded successfully', isSuccess: true });
    } catch (err) {
        console.error(err);
        res.send({ "message": 'Error uploading file to S3', isSuccess: false });

    }
};
