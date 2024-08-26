import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : null } |
  { 'err' : string };
export interface Status {
  'id' : bigint,
  'text' : string,
  'author' : UserId,
  'timestamp' : Time,
}
export type Time = bigint;
export interface User {
  'id' : UserId,
  'bio' : [] | [string],
  'name' : string,
  'connections' : Array<UserId>,
}
export type UserId = Principal;
export interface _SERVICE {
  'addConnection' : ActorMethod<[UserId], Result>,
  'createUser' : ActorMethod<[string], Result>,
  'getConnections' : ActorMethod<[UserId], Array<UserId>>,
  'getStatusFeed' : ActorMethod<[UserId], Array<Status>>,
  'getUser' : ActorMethod<[UserId], [] | [User]>,
  'postStatus' : ActorMethod<[string], Result>,
  'updateUser' : ActorMethod<[string, [] | [string]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
