// src/common/config/multer-verification.config.ts

import { BadRequestException } from '@nestjs/common';
import { s3, S3_BUCKET } from '../../config/s3.config';
import { extname } from 'path';
import multerS3 from 'multer-s3';

export const multerVerificationOptions = {
  storage: multerS3({
    s3,
    bucket: S3_BUCKET!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: any, file, cb) => {
      const userId = req.user?.userId;

      if (!userId) {
        return cb(
          new BadRequestException('User not found') as any,
          '',
        );
      }

      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      const ext = extname(file.originalname);

      const fileName = `${file.fieldname}-${uniqueSuffix}${ext}`;

      const filePath = `verification/${userId}/${fileName}`;

      cb(null, filePath);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};