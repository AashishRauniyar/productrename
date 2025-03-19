/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from "next/server";
// import { initializeDatabase, insertProduct } from "@/lib/models";
// import fs from "fs";
// import path from "path";
// import db from "@/lib/db";

// // Use /tmp in production for a writable directory; fallback to public/uploads in development.
// const uploadDir =
//   process.env.NODE_ENV === "production"
//     ? path.join("/tmp", "uploads")
//     : path.join(process.cwd(), "public", "uploads");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// export async function POST(req: Request) {
//   // Initialize the database/table if needed.
//   await initializeDatabase();

//   const formData = await req.formData();
//   const old_name = formData.get("old_name") as string;
//   const new_name = formData.get("new_name") as string;
//   const description = formData.get("description") as string;
//   const nextRedirectUrl = formData.get("next_redirect_url") as string;
//   const theme = formData.get("theme") as string; // Expected "dark" or "light"

//   const oldImages: string[] = [];
//   const newImages: string[] = [];

//   // Process file entries.
//   for (const entry of formData.entries()) {
//     const [key, value] = entry;
//     if (value instanceof File) {
//       // Generate a unique file name.
//       const fileName = `${Date.now()}_${value.name}`;
//       // Build the local file path.
//       const localFilePath = path.join(uploadDir, fileName);
//       // Read file as a buffer.
//       const buffer = await value.arrayBuffer();
//       fs.writeFileSync(localFilePath, Buffer.from(buffer));

//       // Build the public URL using your environment variable.
//       const fileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/uploads/${fileName}`;
//       if (key === "old_images") {
//         oldImages.push(fileUrl);
//       } else if (key === "new_images") {
//         newImages.push(fileUrl);
//       }
//     }
//   }

//   try {
//     // Insert product with an empty generated_link field.
//     const { id } = await insertProduct(
//       old_name,
//       new_name,
//       description,
//       oldImages,
//       newImages,
//       nextRedirectUrl,
//       theme,
//       "" // initially empty
//     );
//     // Generate a slug from old_name (e.g., "Old Product" -> "old-product").
//     const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
//     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
//     const generatedLink = `${siteUrl}/product/${slug}-${id}`;

//     // Update the product record with the generated link.
//     await db.query("UPDATE products SET generated_link = ? WHERE id = ?", [
//       generatedLink,
//       id,
//     ]);

//     return NextResponse.json({
//       message: "Batch upload successful",
//       generatedLink,
//     });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { initializeDatabase, insertProduct } from "@/lib/models";
import cloudinary from "@/lib/cloudinary";
import db from "@/lib/db";

export async function POST(req: Request) {
  await initializeDatabase();

  const formData = await req.formData();
  const old_name = formData.get("old_name") as string;
  const new_name = formData.get("new_name") as string;
  const description = formData.get("description") as string;
  const nextRedirectUrl = formData.get("next_redirect_url") as string;
  const theme = formData.get("theme") as string;

  const oldImages: string[] = [];
  const newImages: string[] = [];

  // Upload files to Cloudinary
  for (const entry of formData.entries()) {
    const [key, value] = entry;
    if (value instanceof File) {
      const buffer = await value.arrayBuffer();
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "uploads", // Folder in Cloudinary
            public_id: `${Date.now()}_${value.name}`, // Custom file name
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Error:", error);
              reject("Image upload failed");
            } else if (result) {
              resolve(result.secure_url); // Use secure URL for HTTPS
            }
          }
        );
        uploadStream.end(Buffer.from(buffer));
      });

      const uploadedImageUrl = await uploadPromise;

      if (key === "old_images") {
        oldImages.push(uploadedImageUrl);
      } else if (key === "new_images") {
        newImages.push(uploadedImageUrl);
      }
    }
  }

  try {
    const { id } = await insertProduct(
      old_name,
      new_name,
      description,
      oldImages,
      newImages,
      nextRedirectUrl,
      theme,
      ""
    );

    const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
    const generatedLink = `${siteUrl}/product/${slug}-${id}`;

    await db.query("UPDATE products SET generated_link = ? WHERE id = ?", [
      generatedLink,
      id,
    ]);

    return NextResponse.json({
      message: "Batch upload successful",
      generatedLink,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
