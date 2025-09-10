import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "#top", label: "Bosh sahifa" },
  { href: "#about", label: "Men haqimda" },
  { href: "#skills", label: "Ko'nikmalar" },
  { href: "#projects", label: "Loyihalar" },
  { href: "#contact", label: "Aloqa" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-shadow " +
        (scrolled ? "shadow-sm" : "shadow-none")
      }
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
        <a href="#top" className="font-extrabold text-lg tracking-tight">
          <span className="text-foreground">Javohir</span>{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">Fozilov</span>
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-muted-foreground hover:text-emerald-400 transition-colors data-[active=true]:text-emerald-400"
            >
              {l.label}
            </a>
          ))}
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-muted-foreground hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Menyuni ochish"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-emerald-900/40 shadow-lg">
          <nav className="flex flex-col py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-6 py-3 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-900/20 transition-colors data-[active=true]:text-emerald-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              className="mx-6 mt-2 mb-4 inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black shadow hover:bg-emerald-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bog'lanish
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

export default SiteHeader;