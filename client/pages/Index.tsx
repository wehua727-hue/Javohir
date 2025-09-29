import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ExternalLink, Loader2, Mail, MapPin, Maximize2, Phone, Send } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

function ProfileLightbox({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative h-full w-full rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-emerald-500/40" />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/0 hover:bg-emerald-400/5 transition-colors" />
          {children}
          <span className="pointer-events-none absolute right-2 bottom-2 grid place-items-center h-6 w-6 rounded-full bg-black/60 text-emerald-300 border border-emerald-700">
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-emerald-900/50">
        <DialogTitle className="sr-only">Profil rasmi</DialogTitle>
        <img
          alt="Profil rasmi"
          src="https://cdn.builder.io/api/v1/image/assets%2F1428b91d1a5d49d88d6a511f7a715272%2F71655a966431415dbf78ae77f4f315bf?format=webp&width=1200"
          className="w-full h-auto rounded-xl object-cover"
        />
      </DialogContent>
    </Dialog>
  );
}

function useInViewOnce<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView]);
  return [ref, inView];
}

export default function Index() {
  // Forma ma'lumotlarini localStorage dan olish
  const getInitialState = (key: string, defaultValue: string) => {
    try {
      const saved = localStorage.getItem(key);
      return saved || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Avval kiritilgan ma'lumotlarni localStorage dan olish
  const getSavedContacts = () => {
    try {
      const saved = localStorage.getItem('saved-contacts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [name, setName] = useState(() => getInitialState('contact-name', ""));
  const [email, setEmail] = useState(() => getInitialState('contact-email', ""));
  const [message, setMessage] = useState(() => getInitialState('contact-message', ""));
  const [sending, setSending] = useState(false);
  const [skillsRef, skillsInView] = useInViewOnce<HTMLDivElement>();
  const [savedContacts, setSavedContacts] = useState(getSavedContacts);
  const { toast } = useToast();

  // Telefon raqami uchun ham
  const [phone, setPhone] = useState(() => getInitialState('contact-phone', ""));

  // Forma ma'lumotlarini localStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('contact-name', name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem('contact-email', email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem('contact-phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('contact-message', message);
  }, [message]);

  // Yangi kontakt ma'lumotlarini saqlash
  const saveContact = (contactData: {name: string, email: string, phone: string}) => {
    const existingContacts = [...savedContacts];
    
    // Agar kontakt allaqachon mavjud bo'lsa, uni yangilaymiz
    const existingIndex = existingContacts.findIndex(
      contact => contact.email === contactData.email
    );
    
    if (existingIndex >= 0) {
      existingContacts[existingIndex] = contactData;
    } else {
      // Yangi kontakt qo'shamiz (faqat 5 ta saqlaymiz)
      if (existingContacts.length >= 5) {
        existingContacts.shift(); // Eng eski kontaktni o'chiramiz
      }
      existingContacts.push(contactData);
    }
    
    setSavedContacts(existingContacts);
    localStorage.setItem('saved-contacts', JSON.stringify(existingContacts));
  };

  const emailValid = /.+@.+\..+/.test(email);
  // Yangi validation: telefon raqami uchun (ixtiyoriy, lekin to'g'ri formatda bo'lsa)
  const phoneValid = phone === "" || /^[\+]?[0-9\s\-\(\)]{9,15}$/.test(phone);
  // Yangi validation: xabar uchun kamida 10 belgi
  const canSend = name.trim().length >= 3 && emailValid && phoneValid && message.trim().length >= 10 && !sending;


  const skillList = useMemo(
    () => [
      { name: "HTML/CSS", pct: 100 },
      { name: "JavaScript", pct: 100 },
      { name: "React", pct: 100 },
      { name: "Node.js", pct: 100 },
      { name: "Tailwind CSS", pct: 75 },
    ],
    [],
  );

  // To'g'ridan-to'g'ri Telegram API ga yuborish funksiyasi
  const sendDirectToTelegram = async ({ name, email, phone, message }: { name: string; email: string; phone: string; message: string }) => {
    try {
      const telegramToken = "8407341373:AAENzdAl2-RXLn9OFFQwMtkwPJWd4PRds-w";
      const chatId = "5834939103";
      const telegramMessage = `*Yangi xabar:*

*Ism:* ${name}
*Email:* ${email}${phone ? `
*Telefon:* ${phone}` : ""}

*Xabar:* ${message}`;
      
      // Telegram API ga bevosita murojaat qilish
      const telegramResp = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: "Markdown"
        }),
      });
      
      const telegramData = await telegramResp.json();
      console.log("Telegram javobi:", telegramData);
      
      if (telegramResp.ok && telegramData.ok) {
        return { success: true, data: telegramData };
      } else {
        return { success: false, error: telegramData?.description || "Telegramga yuborishda xatolik" };
      }
    } catch (err) {
      console.error("Telegram xatolik:", err);
      return { success: false, error: "Telegramga ulanishda xatolik yuz berdi" };
    }
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    try {
      console.log("Xabar yuborilmoqda:", { name, email, phone, message });
      
      // Avval server orqali yuborishga harakat qilamiz
      const serverResp = await fetch("/api/contact", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, message }),
      });
      
      console.log("Server javobi:", serverResp.status, serverResp.statusText);
      const serverData = await serverResp.json();
      console.log("Server javob ma'lumoti:", serverData);
      
      if (serverResp.ok) {
        toast({ title: "Xabar yuborildi", description: "Tez orada siz bilan bog'lanaman." });
        // Yangi kontakt ma'lumotlarini saqlaymiz
        saveContact({ name, email, phone });
        // Faqat muvaffaqiyatli yuborilganda forma maydonlarini tozalaymiz
        setName(""); 
        setEmail(""); 
        setPhone(""); 
        setMessage("");
        // localStorage dan ham tozalaymiz
        localStorage.removeItem('contact-name');
        localStorage.removeItem('contact-email');
        localStorage.removeItem('contact-phone');
        localStorage.removeItem('contact-message');
      } else {
        // Agar serverda muammo bo'lsa, to'g'ridan-to'g'ri Telegram API ga murojaat qilamiz
        if (serverData?.error?.flatten?.fieldErrors) {
          // Validatsiya xatoligi
          throw new Error("Iltimos, barcha maydonlarni to'g'ri to'ldiring");
        } else {
          // Boshqa xatoliklar uchun to'g'ridan-to'g'ri Telegram API
          console.log("Serverda xatolik, to'g'ridan-to'g'ri Telegram API ga murojaat qilinmoqda...");
          const telegramResult = await sendDirectToTelegram({ name, email, phone, message });
          
          if (telegramResult.success) {
            toast({ title: "Xabar yuborildi", description: "Tez orada siz bilan bog'lanaman." });
            // Yangi kontakt ma'lumotlarini saqlaymiz
            saveContact({ name, email, phone });
            // Forma maydonlarini tozalaymiz
            setName(""); 
            setEmail(""); 
            setPhone(""); 
            setMessage("");
            // localStorage dan ham tozalaymiz
            localStorage.removeItem('contact-name');
            localStorage.removeItem('contact-email');
            localStorage.removeItem('contact-phone');
            localStorage.removeItem('contact-message');
          } else {
            throw new Error(telegramResult.error);
          }
        }
      }
    } catch (err) {
      console.error("Xatolik:", err);
      // Xatolik haqida batafsil ma'lumot chiqaramiz
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast({ 
          title: "Bog'lanish xatoligi", 
          description: "Server bilan bog'lanishda muammo yuz berdi. Iltimos, internet bog'lanishingizni tekshiring.", 
          variant: "destructive" as any 
        });
      } else {
        toast({ title: "Xatolik", description: (err as Error).message, variant: "destructive" as any });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="top" className="max-w-6xl mx-auto">
      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-16" aria-labelledby="hero-title">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center text-xs uppercase tracking-wider text-emerald-400">
              Full‑Stack Dasturchi
            </p>
            <h1 id="hero-title" className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                Javohir Fozilov
              </span>
            </h1>
            <p className="mt-4 text-xl font-semibold text-emerald-300">
              Full‑Stack Dasturchi
            </p>
            <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
              Zamonaviy web dasturlar va mobil ilovalar yaratishda tajribali dasturchi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="inline-flex">
                <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
                  <ExternalLink className="mr-2" /> Loyihalarni Ko'rish
                </Button>
              </a>
              <a href="#contact">
                <Button className="shadow-lg bg-emerald-500 text-black hover:bg-emerald-400">
                  <Send className="mr-2" /> Bog'lanish
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-800/30 via-emerald-700/20 to-black border border-emerald-900/50 shadow-xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(25rem_25rem_at_70%_20%,rgba(16,185,129,0.25),transparent),radial-gradient(20rem_20rem_at_20%_80%,rgba(163,230,53,0.2),transparent)]" />
              <div className="relative z-10 text-center">
                <div className="mx-auto h-40 w-40 md:h-56 md:w-56 rounded-full p-[3px] bg-gradient-to-br from-emerald-400 to-lime-400">
                  <ProfileLightbox>
                    <img
                      alt="Javohir Fozilov"
                      src="https://cdn.builder.io/api/v1/image/assets%2F1428b91d1a5d49d88d6a511f7a715272%2F71655a966431415dbf78ae77f4f315bf?format=webp&width=800"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </ProfileLightbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid place-items-center"><a href="#about" className="mt-4 text-emerald-400 opacity-70 hover:opacity-100" aria-label="Pastga o'tish">▾</a></div>

      {/* About */}
      <section id="about" className="scroll-mt-28 py-16 border-t border-emerald-900/40" aria-labelledby="about-title">
        <h2 id="about-title" className="text-3xl font-bold text-emerald-400 text-center md:text-left">
          Men haqimda
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="text-muted-foreground leading-relaxed">
              Assalomu alaykum! Men Javohir Fozilov, Full‑Stack dasturchiman. ProX akademiyasida o'qiyman,
              zamonaviy texnologiyalar yordamida muammolarga amaliy va samarali yechimlar yarataman.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Maqsadim — foydalanuvchilar hayotini osonlashtiradigan, ishonchli va kengaytiriladigan web‑saytlar
              va ilovalar yaratish.
            </p>
            <div className="mt-6 rounded-xl border border-emerald-900/40 bg-emerald-500/5 p-4">
              <div className="font-semibold text-emerald-300">
                Mening maqsadim:
              </div>
              <div className="text-sm text-emerald-200/80 mt-1">
                Zamonaviy texnologiyalar orqali maksimal qiymat yaratish.
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-emerald-900/40 shadow-xl bg-gradient-to-br from-emerald-900/30 to-black p-2">
              <img
                alt="ProX"
                className="w-full h-64 object-cover rounded-xl"
                src="https://cdn.builder.io/api/v1/image/assets%2F1428b91d1a5d49d88d6a511f7a715272%2F9a6f646752a545bd8ebea14deb894c1c?format=webp&width=800"
              />
            </div>
            <span className="absolute -left-2 bottom-6 h-3 w-3 rounded-full bg-orange-400" />
            <span className="absolute -right-2 top-6 h-3 w-3 rounded-full bg-orange-400" />
          </div>
        </div>
      </section>

      {/* Skills with animated progress */}
      <section id="skills" className="scroll-mt-28 py-16 border-t border-emerald-900/40" aria-labelledby="skills-title">
        <h2 id="skills-title" className="text-3xl font-bold text-emerald-400">
          Ko'nikmalar
        </h2>
        <div ref={skillsRef} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillList.map((s) => (
            <div key={s.name} className="">
              <div className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span className="text-muted-foreground">{s.pct}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-emerald-900/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-1000"
                  style={{ width: skillsInView ? `${s.pct}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="scroll-mt-28 py-16 border-t border-emerald-900/40" aria-labelledby="projects-title">
        <h2 id="projects-title" className="text-3xl font-bold text-emerald-400 text-center">
          Loyihalar
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Shirinliklar Rolami loyihasi */}
          <div className="rounded-2xl border border-emerald-900/40 overflow-hidden hover:border-emerald-700 transition-colors">
            <div className="aspect-video bg-gradient-to-br from-emerald-900/30 to-black relative">
              <img
                alt="Shirinliklar Rolami"
                className="w-full h-full object-cover"
                src="/shirinliklar-preview.jpg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-bold text-lg text-white">Shirinliklar Rolami</h3>
                <p className="text-sm text-emerald-200">Online buyurtma qilish platformasi</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-muted-foreground text-sm">
                Shirinliklar rolami - bu online tarzda turli xil shirinliklarni buyurtma qilish imkonini beruvchi veb-ilova.
              </p>
              <a 
                href="https://shirinliklarrolami-uz.onrender.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium"
              >
                Saytga kirish
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Yangi loyihalar shu yerga qo'shiladi */}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-28 py-16 border-t border-emerald-900/40" aria-labelledby="contact-title">
        <h2 id="contact-title" className="text-3xl font-bold text-emerald-400 text-center">
          Bog'lanish
        </h2>
        <p className="mt-2 text-center text-muted-foreground">Keling, birgalikda ajoyib loyihalar yarataylik! 🚀</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: contacts & socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-900/40 hover:border-emerald-700 transition-colors">
              <span className="h-10 w-10 rounded-full grid place-items-center bg-emerald-500/10 text-emerald-300 border border-emerald-800"><Mail /></span>
              <div className="flex-1">
                <div className="text-sm text-emerald-300">Elektron pochta</div>
                <a href="mailto:wehua727@gmail.com" className="text-sm hover:underline">wehua727@gmail.com</a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-900/40 hover:border-emerald-700 transition-colors">
              <span className="h-10 w-10 rounded-full grid place-items-center bg-emerald-500/10 text-emerald-300 border border-emerald-800"><Phone /></span>
              <div className="flex-1">
                <div className="text-sm text-emerald-300">Telefon</div>
                <a href="tel:+998914058481" className="text-sm hover:underline">+998 91 405 84 81</a>
              </div>
            </div>
            <a href="https://maps.google.com/?q=Buxoro,+O'zbekiston" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-emerald-900/40 hover:border-emerald-700 transition-colors">
              <span className="h-10 w-10 rounded-full grid place-items-center bg-emerald-500/10 text-emerald-300 border border-emerald-800"><MapPin /></span>
              <div>
                <div className="text-sm text-emerald-300">Manzil</div>
                <div className="text-sm">Buxoro, O'zbekiston</div>
              </div>
            </a>
            <div className="rounded-xl border border-emerald-900/40 p-4 text-sm text-emerald-300">
              ⚡ 24/7 javob beraman! ⚡
            </div>
          </div>

          {/* Right column: form */}
          <form onSubmit={onSend} className="md:col-span-2 rounded-2xl border border-emerald-900/40 p-6 bg-card text-card-foreground grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedContacts.length > 0 && (
              <div className="md:col-span-2 grid gap-2">
                <label className="text-sm">
                  Avvalgi kontakt ma'lumotlari
                </label>
                <select 
                  onChange={(e) => {
                    const selectedContact = savedContacts.find(
                      (contact: any) => `${contact.name} <${contact.email}>` === e.target.value
                    );
                    if (selectedContact) {
                      setName(selectedContact.name);
                      setEmail(selectedContact.email);
                      setPhone(selectedContact.phone || "");
                    }
                  }}
                  className="h-10 rounded-md bg-transparent border border-emerald-900/50 px-3 outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">Yangi kontakt ma'lumotlarini kiriting</option>
                  {savedContacts.map((contact: any, index: number) => (
                    <option key={index} value={`${contact.name} <${contact.email}>`}>
                      {contact.name} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-sm">
                Ism va familiya
              </label>
              <input 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="h-10 rounded-md bg-transparent border border-emerald-900/50 px-3 outline-none focus:ring-2 focus:ring-emerald-600" 
                placeholder="Ismingizni va familiyangizni kiriting (kamida 3 belgi)" 
              />
              {name.length > 0 && name.length < 3 && (
                <span className="text-xs text-red-400">Ism kamida 3 belgidan iborat bo'lishi kerak</span>
              )}
            </div>
            <div className="grid gap-2">
              <label className="text-sm">
                Elektron pochta
              </label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={`h-10 rounded-md bg-transparent border px-3 outline-none focus:ring-2 ${email.length && !emailValid ? "border-red-500 focus:ring-red-600" : "border-emerald-900/50 focus:ring-emerald-600"}`} 
                placeholder="Email manzilingizni kiriting" 
              />
              {email.length > 0 && !emailValid && (
                <span className="text-xs text-red-400">To'g'ri email manzilini kiriting</span>
              )}
            </div>
            <div className="grid gap-2">
              <label className="text-sm">
                Telefon raqami (ixtiyoriy)
              </label>
              <input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className={`h-10 rounded-md bg-transparent border px-3 outline-none focus:ring-2 ${phone.length && !phoneValid ? "border-red-500 focus:ring-red-600" : "border-emerald-900/50 focus:ring-emerald-600"}`} 
                placeholder="Masalan: +998 90 123 45 67" 
              />
              {phone.length > 0 && !phoneValid && (
                <span className="text-xs text-red-400">To'g'ri telefon raqamini kiriting</span>
              )}
            </div>
            <div className="md:col-span-2 grid gap-2">
              <label className="text-sm">
                Xabar matni
              </label>
              <textarea 
                required 
                rows={5} 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="rounded-md bg-transparent border border-emerald-900/50 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600" 
                placeholder="Xabaringizni batafsil yozing (kamida 10 belgi)" 
              />
              {message.length > 0 && message.length < 10 && (
                <span className="text-xs text-red-400">Xabar kamida 10 belgidan iborat bo'lishi kerak</span>
              )}
              <div className="text-xs text-muted-foreground text-right">{message.length} ta belgi</div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button disabled={!canSend} type="submit" className="bg-gradient-to-r from-emerald-500 to-lime-500 text-black hover:from-emerald-400 hover:to-lime-400 disabled:opacity-60 disabled:cursor-not-allowed">
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Xabar Yuborish
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}