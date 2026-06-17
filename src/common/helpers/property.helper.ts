import { Property } from '../../modules/properties/entities/property.entity';
import { CryptoUtil } from '../../common/utils/crypto.util';

export class PropertyHelper {
  static decrypt(property: Property): Property {
    if (property.owner_email) {
      property.owner_email = CryptoUtil.decrypt(
        property.owner_email,
      );
    }

    if (property.owner_phone) {
      property.owner_phone = CryptoUtil.decrypt(
        property.owner_phone,
      );
    }

    return property;
  }
}