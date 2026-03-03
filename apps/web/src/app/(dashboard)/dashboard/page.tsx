import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-indigo-400">ConsentKit Dashboard</h1>
      <p className="text-slate-400 mt-2">Welcome, {session.user?.email}</p>
    </div>
  );
}
