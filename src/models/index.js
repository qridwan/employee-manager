// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const UserStatus = {
  "ACTIVE": "ACTIVE",
  "BANNED": "BANNED"
};

const { Users } = initSchema(schema);

export {
  Users,
  UserStatus
};