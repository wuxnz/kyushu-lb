import refresh from "@/lib/refresh";
import createStore from "react-auth-kit/createStore";

const authStore = createStore({
  debug: true,
  authName: "_auth",
  authType: "cookie",
  cookieDomain:
    typeof window !== "undefined" ? window.location.hostname : "key",
  cookieSecure:
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : false,
  refresh: refresh,
});

export default authStore;
