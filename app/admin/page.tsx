import Admin from "@/components/Admin";
import { authReady, isAdmin } from "@/lib/auth";
import { hasStore, readContent } from "@/lib/store";
import { seed } from "@/lib/content";
export const metadata = {
  title: "Studio Dashboard",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const authenticated = await isAdmin();
  const configured = authReady() && hasStore();
  return (
    <Admin
      initialContent={authenticated ? await readContent() : seed}
      authenticated={authenticated}
      configured={configured}
    />
  );
}
