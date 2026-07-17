import { useClerk } from "@clerk/nextjs";
import { disconnectSocket } from "../socket";

const useLogout = () => {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      disconnectSocket();
      // signOut() updates Clerk's isSignedIn to false.
      // ClientInitializer watches isSignedIn and does the hard redirect once it's false.
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      window.location.replace("/");
    }
  };

  return handleLogout;
};

export default useLogout;
