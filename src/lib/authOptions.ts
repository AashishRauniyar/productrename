/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByUsername, seedAdminUser } from "@/lib/admin";
import { verifyPassword } from "@/lib/auth";

// Seed a default admin user (optional)
await seedAdminUser();

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET, // or a hardcoded secret for development
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const users = await getUserByUsername(credentials?.username!);
        if (!users || (users as any[]).length === 0) {
          throw new Error("No user found");
        }
        const adminUser = (users as any[])[0];
        const isValid = await verifyPassword(
          credentials?.password!,
          adminUser.password
        );
        if (!isValid) {
          throw new Error("Invalid password");
        }
        if (adminUser.role !== "admin") {
          throw new Error("Not an admin user");
        }
        return { id: adminUser.id, name: adminUser.username };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
};
