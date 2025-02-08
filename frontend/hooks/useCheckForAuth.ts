import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { signOut } from "next-auth/react";

function useCheckForAuth(statusCode: number): boolean {
  const signOutRAK = useSignOut();
  if (statusCode === 401) {
    signOutRAK();
    signOut({ callbackUrl: "/signin" });
    return false;
  }
  const authUser = useAuthUser();

  if (authUser === null) {
    signOutRAK();
    signOut({ callbackUrl: "/signin" });
    return false;
  }

  const authHeader = useAuthHeader();
  if (authHeader === null) {
    signOutRAK();
    signOut({ callbackUrl: "/signin" });
    return false;
  } else {
    return true;
  }
}

export default useCheckForAuth;
