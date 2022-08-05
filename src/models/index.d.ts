import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BANNED = "BANNED"
}



type UsersMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Users {
  readonly id: string;
  readonly name?: string | null;
  readonly company?: string | null;
  readonly role?: string | null;
  readonly verified?: boolean | null;
  readonly status?: UserStatus | keyof typeof UserStatus | null;
  readonly img?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Users, UsersMetaData>);
  static copyOf(source: Users, mutator: (draft: MutableModel<Users, UsersMetaData>) => MutableModel<Users, UsersMetaData> | void): Users;
}