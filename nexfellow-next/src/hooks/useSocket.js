import { useSyncExternalStore } from "react";
import { getSocket, subscribeSocket } from "../utils/socket";

/**
 * Returns the shared socket.io client, or null until it has been created.
 *
 * The socket is created asynchronously (it waits for a Clerk session token),
 * so a page loaded directly can render before it exists. Components re-render
 * when it becomes available (or is reset on logout); effects that register
 * listeners should guard on `socket` and list it as a dependency.
 */
export default function useSocket() {
  return useSyncExternalStore(subscribeSocket, getSocket, () => null);
}
