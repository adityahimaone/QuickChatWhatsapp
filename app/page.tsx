import WhatsAppForm from "@/components/WhatsAppForm";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { motion } from "framer-motion";
import TitleApp from "@/components/TitleApp";
import { authOptions } from "./api/auth/options";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          {session ? (
            <div className="space-x-2">
              <Link href="/history">
                <Button variant="outline">Message History</Button>
              </Link>
              <Link href="/api/auth/signout?callbackUrl=/">
                <Button variant="outline">Sign Out</Button>
              </Link>
            </div>
          ) : (
            <Link href="/api/auth/signin/google">
              <Button>Sign in with Google</Button>
            </Link>
          )}
        </div>

        <TitleApp />
        <WhatsAppForm />
      </div>
    </div>
  );
}
