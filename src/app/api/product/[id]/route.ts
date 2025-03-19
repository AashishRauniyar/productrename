/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import db from "@/lib/db";

// ✅ GET: Fetch a product by ID.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Await the params object.
  const { id } = await params;
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  const products = rows as any[];
  if (!products || products.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(products[0]);
}

// ✅ PUT: Update a product by ID.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  // Use formData() because the request payload is multipart/form-data.
  const formData = await request.formData();
  const old_name = formData.get("old_name") as string;
  const new_name = formData.get("new_name") as string;
  const description = formData.get("description") as string;
  const next_redirect_url = formData.get("next_redirect_url") as string;
  const theme = formData.get("theme") as string;

  // Regenerate the generated_link based on new old_name.
  const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const generated_link = `${siteUrl}/product/${slug}-${id}`;

  try {
    await db.query(
      `UPDATE products
       SET old_name = ?, new_name = ?, description = ?, next_redirect_url = ?, theme = ?, generated_link = ?
       WHERE id = ?`,
      [
        old_name,
        new_name,
        description,
        next_redirect_url,
        theme,
        generated_link,
        id,
      ]
    );
    return NextResponse.json({ message: "Product updated", generated_link });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Remove a product by ID.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
