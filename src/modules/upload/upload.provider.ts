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
      // const id = (req.body as any)?.id;
      const inspectionId = req.params.inspection_id;

       if (!inspectionId) {
        return cb(
          new BadRequestException(
            'inspection_id is required',
          ) as any,
          '',
        );
      }

      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      const ext = extname(file.originalname);
      const fileName = `${file.fieldname}-${uniqueSuffix}${ext}`;
      const filePath = `users/${inspectionId}/${fileName}`;

      cb(null, filePath);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};