export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          © {new Date().getFullYear()} Javohir Fozilov. Barcha huquqlar himoyalangan.
        </p>
        <p className="text-emerald-400">
          Full‑Stack Dasturchi
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
