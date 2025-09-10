import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_60rem_at_70%_-10%,hsl(var(--primary)/0.18),transparent_60%),radial-gradient(60rem_60rem_at_-10%_10%,hsl(var(--accent)/0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] bg-[linear-gradient(to_right,transparent,rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(to_bottom,transparent,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <SiteHeader />
      <main className="px-6 md:px-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export default Layout;
