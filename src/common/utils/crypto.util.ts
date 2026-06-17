import * as crypto from 'crypto';
const algorithm = 'aes-256-gcm';
const key = crypto
    .createHash('sha256')
    .update(process.env.CRYPTO_SECRET || '5c5e591190424b7d8ddf241850d0c51be04d367996a3fad14b8198fa3f2f55d8')
    .digest();

export class CryptoUtil {

    static encrypt(text: string): string {
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);

        const encrypted = Buffer.concat([
            cipher.update(text, 'utf8'),
            cipher.final(),
        ]);

        const authTag = cipher.getAuthTag();

        // store iv:data:tag
        return [iv.toString('hex'), encrypted.toString('hex'), authTag.toString('hex'),].join(':');
    }

    static decrypt(payload: string): string {
        try {
            const [ivHex, dataHex, tagHex] = payload.split(':');

            const iv = Buffer.from(ivHex, 'hex');
            const data = Buffer.from(dataHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');

            const decipher = crypto.createDecipheriv(algorithm, key, iv);

            decipher.setAuthTag(tag);

            const decrypted = Buffer.concat([
                decipher.update(data),
                decipher.final(),
            ]);

            return decrypted.toString('utf8');

        } catch (error) {
            return payload;
        }
    }
}