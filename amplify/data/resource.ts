import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Group: a.model({
    name: a.string(),
    notes: a.hasMany('Note', 'groupId'), // <- must match the foreign key field in Note
  })
  .authorization((allow) => [allow.owner()]),

  Note: a.model({
    name: a.string(),
    description: a.string(),
    image: a.string(),
    groupId: a.id(), // <- required to define the foreign key
    group: a.belongsTo('Group', 'groupId'), // <- must match field name above
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
