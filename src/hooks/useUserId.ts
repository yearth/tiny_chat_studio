"use client";

import { useSession } from "next-auth/react";

const DEV_USER_ID = "cm8showqr0000jsdgu3gx5bof";

export const useUserId = () => {
  const { data: session } = useSession();

  const userId =
    process.env.NODE_ENV === "production" && session?.user?.id
      ? session.user.id
      : DEV_USER_ID;

  return userId;
};
