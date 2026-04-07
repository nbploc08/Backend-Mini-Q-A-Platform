import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { InternalJwtService } from 'src/modules/internal-jwt/internal-jwt.service';
import { handleAxiosError } from '@common/core';

@Injectable()
export class CloudinaryClientService {
  private readonly client: AxiosInstance;

  constructor(
    private config: ConfigService,
    private internalJwt: InternalJwtService,
  ) {
    const baseURL = this.config.get<string>('CONTENT_SERVICE_URL') || 'http://localhost:8003';
    this.client = axios.create({
      baseURL,
      timeout: 30_000,
      maxRedirects: 0,
      validateStatus: () => true,
    });
  }

  private getHeaders(requestId: string, authToken?: string) {
    const headers: Record<string, string> = {
      'x-request-id': requestId,
    };
    if (authToken) {
      headers['Authorization'] = authToken;
    } else {
      const token = this.internalJwt.signInternalToken({});
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getImages(requestId: string, authToken?: string) {
    try {
      const response = await this.client.get('cloudinary/internal/images', {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service cloudinary request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service cloudinary request failed');
    }
  }

  async uploadImage(
    file: Buffer,
    originalname: string,
    mimetype: string,
    requestId: string,
    authToken?: string,
  ) {
    try {
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      formData.append('file', file, {
        filename: originalname,
        contentType: mimetype,
      });

      const response = await this.client.post('cloudinary/internal/image/upload', formData, {
        headers: {
          ...this.getHeaders(requestId, authToken),
          ...formData.getHeaders(),
        },
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service cloudinary upload failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service cloudinary upload failed');
    }
  }
}
