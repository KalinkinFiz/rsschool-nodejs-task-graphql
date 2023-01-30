import * as DataLoader from 'dataloader';
import DB from '../../../utils/DB/DB';

import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';

export class DataLoaders {
  users: DataLoader<any, UserEntity>;
  posts: DataLoader<any, PostEntity>;
  profiles: DataLoader<any, ProfileEntity>;
  memberTypes: DataLoader<any, MemberTypeEntity>;

  constructor(db: DB) {
    this.users = new DataLoader(async (userIds) => {
      const user = await db.users.findMany();

      const usersMap = user.reduce(
        (map, user) => map.set(user.id, user),
        new Map<string, UserEntity>(),
      );

      return userIds.map((userId) => usersMap.get(String(userId))!);
    });

    this.posts = new DataLoader(async (userIds) => {
      const posts = await db.posts.findMany();

      const postsMap = posts.reduce(
        (map, post) => map.set(post.userId, post),
        new Map<string, PostEntity>(),
      );

      return userIds.map((userId) => postsMap.get(String(userId))!);
    });

    this.profiles = new DataLoader(async (userIds) => {
      const profiles = await db.profiles.findMany();

      const profilesMap = profiles.reduce(
        (map, profile) => map.set(profile.userId, profile),
        new Map<string, ProfileEntity>(),
      );

      return userIds.map((userId) => profilesMap.get(String(userId))!);
    });

    this.memberTypes = new DataLoader(async (memberTypeIds) => {
      const memberTypes = await db.memberTypes.findMany();

      const memberTypesMap = memberTypes.reduce(
        (map, memberType) => map.set(memberType.id, memberType),
        new Map<string, MemberTypeEntity>(),
      );

      return memberTypeIds.map(
        (memberTypeId) => memberTypesMap.get(String(memberTypeId))!,
      );
    });
  }

  clear() {
    this.users.clearAll();
    this.posts.clearAll();
    this.profiles.clearAll();
    this.memberTypes.clearAll();
  }
}
