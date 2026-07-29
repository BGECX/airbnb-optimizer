"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { LogIn, UserPlus } from "lucide-react";
import Button from "./ui/Button";

export default function AuthButtons() {
  const { isSignedIn, user } = useUser();
  const t = useTranslations("auth");

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm text-gray-600">
          {user?.firstName || user?.emailAddresses[0]?.emailAddress}
        </span>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">
          <LogIn className="w-4 h-4 mr-1.5" />
          {t("signIn")}
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm">
          <UserPlus className="w-4 h-4 mr-1.5" />
          {t("signUp")}
        </Button>
      </SignUpButton>
    </div>
  );
}
