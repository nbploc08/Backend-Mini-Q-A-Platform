import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { InternalJwtService } from 'src/modules/internal-jwt/internal-jwt.service';
import { handleAxiosError } from '@common/core';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RejectPostDto } from './dto/reject-post.dto';

@Injectable()
export class PostsClientService {
  private readonly client: AxiosInstance;

  constructor(
    private config: ConfigService,
    private internalJwt: InternalJwtService,
  ) {
    const baseURL = this.config.get<string>('CONTENT_SERVICE_URL') || 'http://localhost:8003';
    this.client = axios.create({
      baseURL,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
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

  async create(dto: CreatePostDto, authToken: string, requestId: string) {
    try {
      const response = await this.client.post('posts/internal', dto, {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async findAll(
    requestId: string,
    authToken?: string,
    page?: string,
    per_page?: string,
    status?: string,
  ) {
    try {
      const response = await this.client.get('posts/internal', {
        headers: this.getHeaders(requestId, authToken),
        params: { page, per_page, status },
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async findMyPosts(
    authToken: string,
    requestId: string,
    page?: string,
    per_page?: string,
    status?: string,
  ) {
    try {
      const response = await this.client.get('posts/internal/my', {
        headers: this.getHeaders(requestId, authToken),
        params: { page, per_page, status },
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async findOne(id: number, requestId: string, authToken?: string) {
    try {
      const response = await this.client.get(`posts/internal/${id}`, {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async update(id: number, dto: UpdatePostDto, authToken: string, requestId: string) {
    try {
      const response = await this.client.patch(`posts/internal/${id}`, dto, {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async submit(id: number, authToken: string, requestId: string) {
    try {
      const response = await this.client.patch(`posts/internal/${id}/submit`, null, {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async approve(id: number, authToken: string, requestId: string) {
    try {
      const response = await this.client.patch(`posts/internal/${id}/approve`, null, {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async reject(id: number, authToken: string, requestId: string) {
    try {
      const response = await this.client.patch(`posts/internal/${id}/reject`,  {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }

  async remove(id: number, authToken: string, requestId: string) {
    try {
      const response = await this.client.delete(`posts/internal/${id}`, {
        headers: this.getHeaders(requestId, authToken),
      });
      if (response.status >= 400) {
        handleAxiosError(
          { response: { status: response.status, data: response.data } },
          'Content service request failed',
        );
      }
      return response.data;
    } catch (err: unknown) {
      handleAxiosError(err, 'Content service request failed');
    }
  }
}
