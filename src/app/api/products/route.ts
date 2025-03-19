import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [products] = await db.query(
      "SELECT * FROM products ORDER BY id DESC"
    );
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
