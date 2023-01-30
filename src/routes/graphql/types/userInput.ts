import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const UpdateUserInput = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});

export const SubscribeUserInput = new GraphQLInputObjectType({
  name: 'SubscribeUserInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    subscribedToUserId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export const UnsubscribeUserInput = new GraphQLInputObjectType({
  name: 'UnsubscribeUserInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    unsubscribedToUserId: { type: new GraphQLNonNull(GraphQLID) },
  },
});
