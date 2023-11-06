export const ANONYMOUS_RESOURCE = 'anonymous_resource';
import { SetMetadata } from '@nestjs/common';

export const AnonymousResource = () => {
  return SetMetadata(ANONYMOUS_RESOURCE, true);
};
