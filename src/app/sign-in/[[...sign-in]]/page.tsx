import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <SignIn afterSignInUrl="/sync-user" afterSignUpUrl="/sync-user" />;
}
