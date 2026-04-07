import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '@common/core';
import { CloudinaryClientService } from './cloudinary-client.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = /^image\/(jpeg|png|gif|webp|svg\+xml)$/;

@Controller('client/cloudinary')
export class CloudinaryClientController {
  constructor(private readonly cloudinaryService: CloudinaryClientService) {}

  @Public()
  @Get('images')
  @HttpCode(HttpStatus.OK)
  async getImages(@Req() req: any, @Headers('authorization') auth?: string) {
    return this.cloudinaryService.getImages(req.requestId, auth);
  }

  @Post('image/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
      }),
    )
    file: any,
    @Req() req: any,
    @Headers('authorization') auth?: string,
  ) {
    return this.cloudinaryService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      req.requestId,
      auth,
    );
  }
}
