import { AppDataSource } from '../database/data-source';
import { User } from '../modules/users/entities/user.entity';
import * as crypto from 'crypto';
import { CryptoUtil } from '../common/utils/crypto.util';

async function run() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(User);

  const users = await repo.find();

  for (const user of users) {
    if (user.email && !user.email_hash) {
      const email = user.email.toLowerCase().trim();

      user.email_hash = crypto
        .createHash('sha256')
        .update(email)
        .digest('hex');

      user.email_encrypted = CryptoUtil.encrypt(email);

      await repo.save(user);

      console.log(`Migrated: ${user.id}`);
    }
  }

  console.log('Migration completed');
  process.exit(0);
}

run();