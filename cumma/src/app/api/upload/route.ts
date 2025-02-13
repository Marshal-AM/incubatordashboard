import { NextResponse } from 'next/server'
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

export async function POST(request: Request) {
  try {
    const { fileType } = await request.json()

    // Generate a unique filename
    const fileKey = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}${getExtension(fileType)}`

    // Create the command to put the object
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
      ContentType: fileType,
    })

    // Generate a presigned URL for uploading
    const url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 })

    return NextResponse.json({ url, key: fileKey })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { fileKey } = await request.json()

    // Create the command to delete the object
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    })

    // Delete the object from S3
    await s3Client.send(deleteObjectCommand)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

function getExtension(fileType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
  }
  return extensions[fileType] || ''
} 