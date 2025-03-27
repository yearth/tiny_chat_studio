"use client";

import { useSession } from "next-auth/react";

const DEV_USER_ID = "cm8ohycnl0000js6kc26tm9c2";

export const useUserId = () => {
  const { data: session } = useSession();

  const userId =
    process.env.NODE_ENV === "production" && session?.user?.id
      ? session.user.id
      : DEV_USER_ID;

  return userId;
};
