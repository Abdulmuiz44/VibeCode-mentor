
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import AdminClient from "./AdminClient";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'abdulmuizproject@gmail.com';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth');
  }

  // Strict check for admin email
  if (session.user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  return <AdminClient />;
}
