export class OtpUtil {
    static generateOtp(length = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min)).toString();
    }
}