import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Group: a.model({
    name: a.string(),
    notes: a.hasMany('Note', 'group'),
  })
  .authorization((allow) => [allow.owner()]),

  Note: a.model({
    name: a.string(),
    description: a.string(),
    image: a.string(),
    group: a.belongsTo('Group', 'group'),
  })
  .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
