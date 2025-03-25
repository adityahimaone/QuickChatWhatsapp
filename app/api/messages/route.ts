import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to save contacts" },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Use email as the identifier since we don't have a reliable user.id
    const userEmail = session.user.email;

    console.log("Using user email:", userEmail);

    const { phoneNumber, country, name } = await request.json();

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          phone_number: phoneNumber,
          country_code: country,
          name: name,
          user_email: userEmail,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
