import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { InternalJwtService } from 'src/modules/internal-jwt/internal-jwt.service';
import { handleAxiosError } from '@common/core';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsClientService {
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

  async create(dto: CreateCommentDto, authToken: string, requestId: string) {
    try {
      const response = await this.client.post('comments/internal', dto, {
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

  async findByPost(
    postId: number,
    requestId: string,
    authToken?: string,
    page?: string,
    per_page?: string,
  ) {
    try {
      const response = await this.client.get(`comments/internal/post/${postId}`, {
        headers: this.getHeaders(requestId, authToken),
        params: { page, per_page },
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

  async findByQuestion(
    questionId: number,
    requestId: string,
    authToken?: string,
    page?: string,
    per_page?: string,
  ) {
    try {
      const response = await this.client.get(`comments/internal/question/${questionId}`, {
        headers: this.getHeaders(requestId, authToken),
        params: { page, per_page },
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
      const response = await this.client.get(`comments/internal/${id}`, {
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

  async update(id: number, dto: UpdateCommentDto, authToken: string, requestId: string) {
    try {
      const response = await this.client.patch(`comments/internal/${id}`, dto, {
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
      const response = await this.client.delete(`comments/internal/${id}`, {
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
