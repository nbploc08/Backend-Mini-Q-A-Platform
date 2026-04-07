import { Injectable, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  onModuleInit() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_SECRET_KEY,
    });
  }

  async uploadToEcommerceFolder(image: string): Promise<UploadApiResponse> {
    return await cloudinary.uploader.upload(image, {
      folder: 'samples/ecommerce',
      width: 150,
    });
  }

  async uploadFileToEcommerceFolder(file: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'samples/ecommerce',
          width: 150,
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message));
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed'));
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async getImagesList(): Promise<any> {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'samples/ecommerce',
      max_results: 50,
    });
    return result.resources.map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      format: resource.format,
      createdAt: resource.created_at,
    }));
  }
}
