import WhatsAppForm from "@/components/WhatsAppForm";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl font-bold">WhatsApp Sender</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Format and send WhatsApp messages with ease
          </p>
        </div>

        {session ? (
          <>
            <WhatsAppForm />
            <div className="mt-4 text-center">
              <Link href="/history">
                <Button variant="outline">View Message History</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <Link href="/api/auth/signin">
              <Button size="lg">Sign in with Google to start</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
