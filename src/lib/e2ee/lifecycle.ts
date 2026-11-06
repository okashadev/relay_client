import { useE2eeStore } from "@/store/e2eeStore";
import { clearChatKeyCache } from "./chatKeys";
import { resetSession } from "./session";

export const endSession = () => {
  resetSession();
  clearChatKeyCache();
  useE2eeStore.getState().reset();
};
