import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export function generateFileName(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

interface GetPresignedUrlParams {
  fileName: string
  fileType: string
}

export async function getPresignedUrl({ fileName, fileType }: GetPresignedUrlParams) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  })

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }) // URL expires in 60 seconds
    return {
      success: true,
      url: signedUrl,
      key: fileName,
    }
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return { success: false, error: 'Failed to generate upload URL' }
  }
}

export async function deleteFile(fileName: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  })

  try {
    await s3Client.send(command)
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: 'Failed to delete file' }
  }
} 