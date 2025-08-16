import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp afterSignInUrl="/sync-user" afterSignUpUrl="/sync-user" />;
}
