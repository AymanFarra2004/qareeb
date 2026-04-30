if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined in environment variables");
}

export const CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://www.qareeb.cc",
  SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@qareeb.cc",
};
