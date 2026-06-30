import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel — Arthrex AI',
  robots: { index: false, follow: false },
};

// No extra wrapper UI — the admin page builds its own full layout (sidebar + topbar)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
