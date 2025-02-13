'use client'

import Image from 'next/image'
import { ImageUpload } from './image-upload'
import { UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfilePictureProps {
  imageUrl?: string | null
  size?: number
  isEditing?: boolean
  onImageChange?: (urls: string[]) => void
  onImageRemove?: () => void
  className?: string
}

export function ProfilePicture({
  imageUrl,
  size = 128,
  isEditing = false,
  onImageChange,
  onImageRemove,
  className
}: ProfilePictureProps) {
  if (isEditing) {
    return (
      <div className={cn("w-full max-w-[256px]", className)}>
        <ImageUpload
          value={imageUrl ? [imageUrl] : []}
          onChange={onImageChange}
          onRemove={onImageRemove}
        />
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Profile Picture"
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <UserCircle className="w-3/4 h-3/4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
} 