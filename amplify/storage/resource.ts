import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "amplifyNotesDrive",
  access: (allow) => ({
    "public/images/{identity.identityId}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});
