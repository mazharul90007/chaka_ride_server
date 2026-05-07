import 'multer';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file buffer is empty');
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'chaka_ride' },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(
              new Error(error.message || 'Cloudinary upload failed'),
            );
          }
          if (!result) {
            return reject(new Error('Cloudinary result is undefined'));
          }
          resolve(result);
        },
      );

      upload.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      void cloudinary.uploader.destroy(publicId, (error: any) => {
        if (error) {
          const err = error as Record<string, any>;
          const errorMessage =
            typeof err.message === 'string' ? err.message : 'Deletion failed';

          return reject(new Error(errorMessage));
        }
        resolve();
      });
    });
  }

  extractPublicIdFromUrl(url: string | null): string | null {
    if (!url) return null;
    try {
      const parts = url.split('/');
      const fileNameWithExtension = parts.pop();
      const folder = parts.pop();
      if (!fileNameWithExtension || !folder) return null;

      const publicId = fileNameWithExtension.split('.')[0];
      return `${folder}/${publicId}`;
    } catch {
      return null;
    }
  }
}
