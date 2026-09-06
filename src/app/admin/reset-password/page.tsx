import type { Metadata } from "next";

import AdminResetPasswordForm from "@/components/admin/login/AdminResetPasswordForm";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `Reset Admin Password | ${siteConfig.name}` },
  description: "Reset the GTBS administrator password using a secure link.",
};

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error = "" } = await searchParams;
  return <AdminResetPasswordForm token={token} invalidToken={Boolean(error)} />;
}
