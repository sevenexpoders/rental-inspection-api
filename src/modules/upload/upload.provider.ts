import { BadRequestException } from '@nestjs/common';
import { s3, S3_BUCKET } from '../../config/s3.config';
import { extname } from 'path';
import multerS3 from 'multer-s3';
import { Request } from 'express';

export const multerS3Options = {
  storage: multerS3({
    s3,
    bucket: S3_BUCKET!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: Request, file, cb) => {
      const id = (req.body as any)?.id ?? '5d8bca7e-fd6e-4f89-ac3b-0a185210ce76';

      if (!id) {
        return cb(
          new BadRequestException('id is required for upload') as any,
          '',
        );
      }

      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      const ext = extname(file.originalname);
      const fileName = `${file.fieldname}-${uniqueSuffix}${ext}`;
      const filePath = `users/${id}/${fileName}`;

      cb(null, filePath);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};