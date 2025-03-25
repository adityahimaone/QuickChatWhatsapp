import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HistoryClient from "@/components/HistoryClient";

export const dynamic = "force-dynamic";

const countries = [
  { code: "ID", flag: "🇮🇩" },
  { code: "MY", flag: "🇲🇾" },
  { code: "SG", flag: "🇸🇬" },
  { code: "TH", flag: "🇹🇭" },
  { code: "PH", flag: "🇵🇭" },
  { code: "US", flag: "🇺🇸" },
  { code: "GB", flag: "🇬🇧" },
  { code: "IN", flag: "🇮🇳" },
  { code: "BR", flag: "🇧🇷" },
  { code: "MX", flag: "🇲🇽" },
  { code: "ES", flag: "🇪🇸" },
  { code: "DE", flag: "🇩🇪" },
];

export default async function History() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false });

  return <HistoryClient messages={messages || []} countries={countries} />;
}
