import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { InternalJwtService } from 'src/modules/internal-jwt/internal-jwt.service';
import { handleAxiosError } from '@common/core';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsClientService {
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

  async create(dto: CreateQuestionDto, authToken: string, requestId: string) {
    try {
      const response = await this.client.post('questions/internal', dto, {
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
  ) {
    try {
      const response = await this.client.get('questions/internal', {
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

  async findMyQuestions(
    authToken: string,
    requestId: string,
    page?: string,
    per_page?: string,
  ) {
    try {
      const response = await this.client.get('questions/internal/my', {
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
      const response = await this.client.get(`questions/internal/${id}`, {
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

  async update(id: number, dto: UpdateQuestionDto, authToken: string, requestId: string) {
    try {
      const response = await this.client.patch(`questions/internal/${id}`, dto, {
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
      const response = await this.client.delete(`questions/internal/${id}`, {
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
