import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
          cookies: () => cookieStore,
        });

        // Try to sign in with email
        const {
          data: { user: supabaseUser },
          error: signInError,
        } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.email,
        });

        if (signInError || !supabaseUser) {
          const {
            data: { user: newUser },
            error: signUpError,
          } = await supabase.auth.signUp({
            email: user.email,
            password: user.email,
            options: {
              data: {
                name: user.name,
                avatar_url: user.image,
              },
            },
          });

          if (signUpError) {
            console.error("Error creating Supabase user:", signUpError);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session?.user?.email) {
        try {
          const cookieStore = cookies();
          const supabase = createRouteHandlerClient({
            cookies: () => cookieStore,
          });

          // Sign in to Supabase with email to ensure session is active
          await supabase.auth.signInWithPassword({
            email: session.user.email,
            password: session.user.email,
          });

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            session.user.id = user.id;
          }
        } catch (error) {
          console.error("Error getting Supabase user:", error);
        }
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};
