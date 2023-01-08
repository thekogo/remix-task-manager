import { Profile } from "@line/bot-sdk";
import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserOrCreateByLineProfile(lineProfile: Profile) {
  return prisma.user.upsert({
    where: {
      lineId: lineProfile.userId,
    },
    update: {},
    create: {
      lineId: lineProfile.userId,
      displayName: lineProfile.displayName,
      pictureUrl: lineProfile.pictureUrl,
    }
  })
}
