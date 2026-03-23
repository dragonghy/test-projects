import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("rsvp")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, attendance, guestCount, dietary, message } = body;

    if (!name || attendance === undefined) {
      return NextResponse.json(
        { error: "Name and attendance are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rsvp")
      .insert({
        name,
        attending: Boolean(attendance),
        guests: Number(guestCount) || 1,
        dietary: dietary || "",
        message: message || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
