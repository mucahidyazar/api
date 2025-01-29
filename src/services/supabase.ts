import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET_NAMES = ['images-profile', 'images-wallet', 'images-wishlist'] as const
type BucketName = typeof BUCKET_NAMES[number]

interface UploadFileOptions {
  bucket: string
  file: Buffer
  contentType: string
  userId: string
  oldFileUrl?: string
}

export class StorageService {
  private static validateBucket(bucket: string): asserts bucket is BucketName {
    if (!BUCKET_NAMES.includes(bucket as BucketName)) {
      throw new Error(`Invalid bucket name. Must be one of: ${BUCKET_NAMES.join(', ')}`)
    }
  }

  static async uploadFile({
    bucket,
    file,
    contentType,
    userId,
    oldFileUrl
  }: UploadFileOptions): Promise<string> {
    try {
      this.validateBucket(bucket)

      // Generate unique filename with user ID prefix
      const fileExt = contentType.split('/').pop() || 'jpg'
      const fileName = `${userId}_${nanoid()}.${fileExt}`

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType,
          upsert: false
        })

      if (error) {
        throw error
      }

      if (oldFileUrl) {
        await this.deleteFile(oldFileUrl, bucket)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  static async deleteFile(fileUrl: string, bucket: string): Promise<void> {
    try {
      this.validateBucket(bucket)

      // Extract filename from URL
      const fileName = fileUrl.split('/').pop()
      if (!fileName) {
        throw new Error('Invalid file URL')
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('File deletion error:', error)
      throw error
    }
  }

  static async updateFile(
    oldFileUrl: string | null,
    options: Omit<UploadFileOptions, 'oldFileUrl'>
  ): Promise<string> {
    try {
      return await this.uploadFile({
        ...options,
        oldFileUrl: oldFileUrl || undefined
      })
    } catch (error) {
      console.error('File update error:', error)
      throw error
    }
  }
}