import * as crypto from 'crypto';

export class HashUtil {
  
  static sha256(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value.trim().toLowerCase())
      .digest('hex');
  }
}