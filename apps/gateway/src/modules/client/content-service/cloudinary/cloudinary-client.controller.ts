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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CloudinaryClientService } from './cloudinary-client.service';
import {
  GET_IMAGES_OPERATION,
  GET_IMAGES_RESPONSE,
  UPLOAD_IMAGE_OPERATION,
  UPLOAD_IMAGE_CONSUMES,
  UPLOAD_IMAGE_BODY,
  UPLOAD_IMAGE_RESPONSE,
  UPLOAD_IMAGE_ERROR_RESPONSES,
} from './swagger/cloudinary.swagger';
import { INTERNAL_SERVER_ERROR_RESPONSE } from 'src/modules/share/swagger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = /^image\/(jpeg|png|gif|webp|svg\+xml)$/;

@ApiTags('Cloudinary')
@Controller('client/cloudinary')
export class CloudinaryClientController {
  constructor(private readonly cloudinaryService: CloudinaryClientService) {}

  @Public()
  @Get('images')
  @HttpCode(HttpStatus.OK)
  @GET_IMAGES_OPERATION
  @GET_IMAGES_RESPONSE
  @INTERNAL_SERVER_ERROR_RESPONSE
  async getImages(@Req() req: any, @Headers('authorization') auth?: string) {
    return this.cloudinaryService.getImages(req.requestId, auth);
  }

  @Post('image/upload')
  @HttpCode(HttpStatus.CREATED)
  @UPLOAD_IMAGE_OPERATION
  @UPLOAD_IMAGE_CONSUMES
  @UPLOAD_IMAGE_BODY
  @UPLOAD_IMAGE_RESPONSE
  @UPLOAD_IMAGE_ERROR_RESPONSES.BAD_REQUEST
  @UPLOAD_IMAGE_ERROR_RESPONSES.UNAUTHORIZED
  @INTERNAL_SERVER_ERROR_RESPONSE
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
