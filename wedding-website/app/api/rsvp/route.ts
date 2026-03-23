import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "rsvp.json");

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

function readEntries() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeEntries(entries: unknown[]) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function GET() {
  const entries = readEntries();
  return NextResponse.json(entries);
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

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      attendance: Boolean(attendance),
      guestCount: Number(guestCount) || 1,
      dietary: dietary || "",
      message: message || "",
      createdAt: new Date().toISOString(),
    };

    const entries = readEntries();
    entries.unshift(entry);
    writeEntries(entries);

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
