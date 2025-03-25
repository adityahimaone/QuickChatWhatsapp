import NextAuth from "next-auth/next";
import { authOptions } from "../options";

// Create and export the handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
