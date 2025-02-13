'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  onChange: (value: string[]) => void
  onRemove: (value: string) => void
  value: string[]
  disabled?: boolean
}

export function ImageUpload({
  onChange,
  onRemove,
  value,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const uploadToS3 = async (file: File) => {
    try {
      // First, get a presigned URL from our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: file.type })
      })

      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { url, key } = await response.json()

      // Upload the file directly to S3 using the presigned URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      // Construct the public URL for the uploaded image
      return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true)
        const uploadPromises = acceptedFiles.map(file => uploadToS3(file))
        const uploadedUrls = await Promise.all(uploadPromises)
        
        // Combine existing images with new ones
        onChange([...value, ...uploadedUrls])
        toast.success('Images uploaded successfully')
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload images')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, value]
  )

  const handleRemove = async (url: string) => {
    try {
      // Extract the key from the URL
      const key = url.split('/').pop()
      if (!key) throw new Error('Invalid URL')

      // Call the API to delete the file from S3
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey: key })
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      onRemove(url)
      toast.success('Image removed successfully')
    } catch (error) {
      console.error('Error removing file:', error)
      toast.error('Failed to remove image')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    disabled: disabled || isUploading,
    multiple: true,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          (disabled || isUploading) && 'cursor-not-allowed opacity-75'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="text-sm text-gray-600">
            {isUploading ? (
              <p>Uploading...</p>
            ) : isDragActive ? (
              <p>Drop the images here</p>
            ) : (
              <p>Drag & drop images here, or click to select</p>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Supported formats: PNG, JPG, JPEG, GIF
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg border border-gray-200"
            >
              <Image
                fill
                src={url}
                alt="Upload"
                className="rounded-lg object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 