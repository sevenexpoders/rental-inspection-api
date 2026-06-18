import * as admin from 'firebase-admin';
// import { readFileSync } from 'fs';
// import { join } from 'path';

export class FirebaseUtil {
    private static initialized = false;

    static initialize() {
        if (this.initialized || admin.apps.length) return;

        const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (!envValue) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined in environment variables');
        }
        const serviceAccount = JSON.parse(envValue);

        serviceAccount.private_key = serviceAccount.private_key?.replace(/\\n/g, '\n');
        // const serviceAccount = JSON.parse(
        //     readFileSync(
        //         join(
        //             process.cwd(),
        //             'serviceAccountKey.json',
        //         ),
        //         'utf8',
        //     ),
        // );

        admin.initializeApp({
            credential:
                admin.credential.cert(
                    serviceAccount,
                ),
        });

        this.initialized = true;
    }

    static async sendNotification(
        token: string,
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<{
        success: boolean;
        invalidToken?: string;
    }> {
        this.initialize();

        try {
            await admin.messaging().send({
                token,
                notification: {
                    title,
                    body,
                },
                data,
            });

            return {
                success: true,
            };
        } catch (error: any) {
            const code = error?.errorInfo?.code;

            if (
                code === 'messaging/registration-token-not-registered' ||
                code === 'messaging/invalid-registration-token'
            ) {
                return {
                    success: false,
                    invalidToken: token,
                };
            }

            throw error;
        }
    }

    static async sendMulticast(
        tokens: string[],
        title: string,
        body: string,
        data?: Record<string, string>,
    ) {
        this.initialize();

        return admin
            .messaging()
            .sendEachForMulticast({
                tokens,
                notification: {
                    title,
                    body,
                },
                data,
            });
    }
}