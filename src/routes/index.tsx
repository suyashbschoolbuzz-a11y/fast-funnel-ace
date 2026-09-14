import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  IndianRupee,
  LockKeyhole,
  MessageCircleMore,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { z } from "zod";

import audiencePhoto from "@/assets/audience.jpg";
import mentorPhoto from "@/assets/mentor.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creator Circle — Join for ₹3" },
      {
        name: "description",
        content: "Join an action-first creator community and turn your ideas into consistent content, confidence and growth for just ₹3.",
      },
      { property: "og:title", content: "Creator Circle — Join for ₹3" },
      {
        property: "og:description",
        content: "Build your voice, content system and creator momentum with a focused community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const registrationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Please enter a valid email"),
  whatsapp: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit WhatsApp number"),
  terms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to continue" }) }),
});

const testimonials = [
  { name: "Aarav S.", role: "College creator", text: "Posted my first reel after months of overthinking. The feedback inside the group made it feel possible.", result: "FIRST REEL LIVE", tone: "bg-proof-lime" },
  { name: "Meera K.", role: "Marketing fresher", text: "I stopped copying random trends and finally found three content pillars that actually sound like me.", result: "3 CONTENT PILLARS", tone: "bg-proof-blue" },
  { name: "Rohan P.", role: "Freelance designer", text: "One community prompt turned into a post that brought me two genuine client conversations.", result: "2 CLIENT LEADS", tone: "bg-proof-yellow" },
  { name: "Nisha R.", role: "Personal brand builder", text: "The weekly accountability is simple, practical and exactly what I needed to stay consistent.", result: "4 WEEKS CONSISTENT", tone: "bg-proof-pink" },
  { name: "Kabir M.", role: "Video creator", text: "No fluff. I fixed my hook, published the same day, and saw my best retention yet.", result: "2.4× RETENTION", tone: "bg-proof-orange" },
];

const curriculum = [
  { title: "Find your unfair content angle", kicker: "CLARITY", bullets: ["Map your skills into a niche people remember", "Choose 3 repeatable content pillars", "Write a one-line creator promise"] },
  { title: "Build a scroll-stopping idea bank", kicker: "IDEAS", bullets: ["Never stare at a blank page again", "Turn everyday moments into posts", "Steal our 30 high-converting prompts"] },
  { title: "Create with a system, not motivation", kicker: "CONSISTENCY", bullets: ["A 60-minute weekly content workflow", "Hooks, scripts and CTA templates", "Community reviews before you publish"] },
  { title: "Turn attention into opportunity", kicker: "GROWTH", bullets: ["Build trust without sounding salesy", "Create a profile that converts", "Move from views to leads and collaborations"] },
];

const faqs = [
  ["Is this really just ₹3?", "Yes. ₹3 unlocks the community access experience shown on this page. There are no hidden charges at registration."],
  ["I am a complete beginner. Will this help?", "Absolutely. The system starts with clarity and simple publishing habits, so you do not need an existing audience or fancy equipment."],
  ["How will I receive access?", "After completing registration, you will receive the next-step confirmation on WhatsApp and email."],
  ["What if I cannot attend live?", "Key resources and prompts are designed to be used at your pace. Live participation helps, but it is not required to begin."],
  ["Do I need to be an influencer?", "No. This is for anyone who wants to communicate their ideas online—students, professionals, founders and creators included."],
];

function scrollToCheckout() {
  document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CtaButton({ className = "", children = "Lock My Spot @ ₹3" }: { className?: string; children?: ReactNode }) {
  return (
    <Button onClick={scrollToCheckout} className={`h-14 rounded-md px-7 text-base font-black shadow-cta transition-transform hover:-translate-y-0.5 ${className}`}>
      {children}<ArrowRight className="size-5" />
    </Button>
  );
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="mx-auto mb-9 max-w-2xl text-center">
    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
    <h2 className="text-balance text-3xl font-black leading-tight text-foreground sm:text-5xl">{title}</h2>
    {copy && <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">{copy}</p>}
  </div>;
}

function CountUp({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValue(end);
      } else {
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / 900, 1);
          setValue(Math.round(end * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [end]);
  return <div ref={ref} className="text-center"><p className="text-2xl font-black tabular-nums sm:text-3xl">{value}{suffix}</p><p className="mt-1 text-xs font-bold uppercase text-muted-foreground">{label}</p></div>;
}

function Index() {
  const [submitted, setSubmitted] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tracking, setTracking] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kept: Record<string, string> = {};
    params.forEach((value, key) => {
      if (key.startsWith("utm_") || key === "fbclid") kept[key] = value;
    });
    setTracking(kept);
  }, []);

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = registrationSchema.safeParse({
      name: form.get("name"), email: form.get("email"), whatsapp: form.get("whatsapp"), terms,
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((issue) => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      return;
    }
    // Tracking parameters are ready to send with the lead when a checkout endpoint is connected.
    void { ...result.data, ...tracking };
    setErrors({});
    setSubmitted(true);
  }

  return <main className="overflow-hidden bg-background pb-24 text-foreground md:pb-0">
    {/* META PIXEL PLACEHOLDER: paste the approved pixel script in the root document head. */}
    {/* GOOGLE TAG MANAGER PLACEHOLDER: add the approved GTM head/body snippets in the root document. */}

    <section className="relative border-b border-border bg-hero px-4 pb-14 pt-5 sm:pb-20 sm:pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black"><span className="grid size-9 place-items-center rounded-md bg-foreground text-background"><Zap className="size-5 fill-current" /></span>CREATOR CIRCLE</div>
          <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-background px-3 py-2 text-xs font-bold shadow-sm"><span className="size-2 animate-pulse rounded-full bg-success" /> New cohort filling fast</div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_.96fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-black uppercase text-accent-foreground"><Sparkles className="size-4" /> India's action-first creator community</div>
            <h1 className="text-balance text-[2.65rem] font-black leading-[1.02] sm:text-6xl lg:text-7xl">Stop scrolling.<br />Start <span className="text-primary">building.</span></h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg font-medium leading-8 text-muted-foreground lg:mx-0">Turn what you know into content people remember—with the system, feedback and community to finally stay consistent.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="chip"><CalendarDays /> Next live: Sunday, 11 AM</span>
              <span className="chip"><Users /> Only 44 seats left</span>
            </div>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <CtaButton className="w-full sm:w-auto" />
              <p className="text-sm font-bold text-muted-foreground"><span className="line-through">₹999</span> today for just <span className="text-xl text-primary">₹3</span></p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex -space-x-3">
                {[0, 1, 2, 3].map((i) => <img key={i} src={audiencePhoto} alt="Community member" className="size-10 rounded-full border-2 border-background object-cover" style={{ objectPosition: `${15 + i * 23}% center` }} />)}
              </div>
              <div className="text-left"><div className="flex text-star">{[0,1,2,3,4].map(i => <Star key={i} className="size-3.5 fill-current" />)}</div><p className="mt-1 text-xs font-bold">Joined by 2,400+ ambitious creators</p></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-3 -top-3 z-10 rotate-[-4deg] rounded-md bg-primary px-4 py-2 text-xs font-black uppercase text-primary-foreground shadow-lg">Watch this first</div>
            <div className="overflow-hidden rounded-lg border-4 border-foreground bg-foreground shadow-editorial">
              <div className="aspect-video">
                <iframe className="h-full w-full" src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?rel=0&modestbranding=1" title="Creator Circle workshop preview" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3 text-background"><span className="flex items-center gap-2 text-sm font-bold"><Play className="size-4 fill-current" /> 2-minute breakthrough</span><span className="text-xs text-background/70">No fluff. Just the plan.</span></div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-background px-2 py-5 shadow-sm sm:px-8">
          <CountUp end={2400} suffix="+" label="Members" /><CountUp end={92} suffix="%" label="Take action" /><CountUp end={4} suffix=".9/5" label="Avg rating" />
        </div>
      </div>
    </section>

    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Proof, not promises" title="Real people. Real results." copy="Small wins become serious momentum when the right people are in your corner." />
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-5 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
          {testimonials.map((item, i) => <article key={item.name} className={`w-[82vw] shrink-0 snap-center rounded-lg border border-foreground/15 p-5 shadow-card md:w-auto ${i < 2 ? "md:col-span-3" : "md:col-span-2"} ${item.tone}`}>
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-full bg-foreground text-sm font-black text-background">{item.name[0]}</div><div><p className="text-sm font-black">{item.name}</p><p className="text-xs opacity-65">{item.role}</p></div></div><MessageCircleMore className="size-5 opacity-50" /></div>
            <p className="text-base font-semibold leading-7">“{item.text}”</p><div className="mt-5 inline-flex rounded-sm bg-foreground px-2.5 py-1.5 text-xs font-black text-background">{item.result}</div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="bg-foreground px-4 py-16 text-background sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Your creator playbook" title="Everything you need to stop guessing" copy="Four practical modules. One clear path from scattered ideas to consistent execution." />
        <Accordion type="single" collapsible defaultValue="module-0" className="space-y-3">
          {curriculum.map((item, i) => <AccordionItem key={item.title} value={`module-${i}`} className="overflow-hidden rounded-lg border border-background/20 bg-surface-dark px-5 sm:px-7">
            <AccordionTrigger className="py-6 text-left text-background hover:no-underline"><span className="flex min-w-0 items-center gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary font-black text-primary-foreground">0{i + 1}</span><span><span className="mb-1 block text-[10px] font-black uppercase tracking-[0.18em] text-accent">{item.kicker}</span><span className="text-lg font-black sm:text-xl">{item.title}</span></span></span></AccordionTrigger>
            <AccordionContent className="pb-6 pl-14 text-background/75"><ul className="space-y-3">{item.bullets.map(b => <li key={b} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />{b}</li>)}</ul></AccordionContent>
          </AccordionItem>)}
        </Accordion>
        <div className="mt-8 text-center"><CtaButton /><p className="mt-3 flex items-center justify-center gap-2 text-xs text-background/60"><LockKeyhole className="size-3.5" /> Secure checkout · Instant access details</p></div>
      </div>
    </section>

    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl"><SectionHeading eyebrow="Built for your starting point" title="If you have something to say, this is for you." />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {["Students", "Freshers", "Creators", "Personal Brands"].map((label, i) => <article key={label} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
            <img src={audiencePhoto} loading="lazy" width={1536} height={1024} alt={`${label} building their creator skills`} className="h-full w-full scale-[1.8] object-cover transition-transform duration-500 group-hover:scale-[1.9]" style={{ objectPosition: `${10 + i * 28}% center` }} />
            <div className="absolute inset-x-0 bottom-0 bg-image-label p-4 text-background"><p className="text-lg font-black sm:text-2xl">{label}</p><p className="mt-1 hidden text-xs text-background/75 sm:block">Build proof, voice and momentum.</p></div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-y border-primary/20 bg-price px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl"><SectionHeading eyebrow="The ₹3 drop" title="A tiny commitment. A serious value stack." />
        <div className="grid gap-4 md:grid-cols-3">
          {[["Creator Clarity Workbook", "₹499", "Your niche, pillars and positioning."], ["30-Day Prompt Vault", "₹799", "Ideas that make publishing easier."], ["Live Community Reviews", "₹1,499", "Fast feedback from people doing the work."]].map(([name, value, copy], i) => <article key={name} className="rounded-lg border border-foreground/15 bg-background p-6 shadow-card"><span className="grid size-10 place-items-center rounded-md bg-accent font-black">0{i+1}</span><h3 className="mt-5 text-xl font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p><p className="mt-5 text-sm font-bold">Value <span className="line-through">{value}</span> <span className="ml-2 text-success">INCLUDED</span></p></article>)}
        </div>
        <div className="mt-7 rounded-lg border-2 border-foreground bg-background p-6 shadow-editorial sm:p-9">
          <div className="grid items-center gap-7 sm:grid-cols-[1fr_auto]">
            <div><div className="inline-flex rounded-full bg-success px-3 py-1 text-xs font-black text-success-foreground">YOU SAVE ₹2,794</div><p className="mt-4 text-sm font-bold uppercase text-muted-foreground">Total value <span className="line-through">₹2,797</span></p><p className="mt-1 text-3xl font-black">Get everything today for</p></div>
            <div className="text-center sm:text-right"><p className="text-7xl font-black text-primary">₹3</p><p className="text-xs font-bold uppercase text-muted-foreground">one-time access</p></div>
          </div><CtaButton className="mt-7 w-full" children="Yes, I Want In for ₹3" />
        </div>
      </div>
    </section>

    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
        <div className="relative mx-auto max-w-md"><div className="absolute -right-3 -top-3 z-10 rotate-3 rounded-md bg-accent px-3 py-2 text-xs font-black">YOUR MENTOR</div><img src={mentorPhoto} loading="lazy" width={1024} height={1280} alt="Arjun Mehta, creator mentor in his studio" className="aspect-[4/5] w-full rounded-lg border-4 border-foreground object-cover shadow-editorial" /></div>
        <div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Meet Arjun Mehta</p><h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">I spent years creating the hard way. You don't have to.</h2>
          <div className="mt-5 flex flex-wrap gap-2"><span className="tag"><BadgeCheck /> Creator educator</span><span className="tag"><Video /> 1,000+ videos reviewed</span><span className="tag"><Users /> Community builder</span></div>
          <p className="mt-6 text-base leading-8 text-muted-foreground">I started with a borrowed phone, no audience, and endless self-doubt. What changed everything wasn't another hack—it was a simple system, honest feedback and people who expected me to show up. Creator Circle is the room I wish I had on day one.</p>
          <blockquote className="mt-6 border-l-4 border-primary pl-5 text-xl font-black leading-8">“You do not need more confidence to begin. You build confidence by beginning.”</blockquote>
          <div className="mt-7 grid grid-cols-3 divide-x divide-border rounded-lg bg-muted p-4"><CountUp end={8} suffix="+" label="Years creating" /><CountUp end={120} suffix="M+" label="Views studied" /><CountUp end={2400} suffix="+" label="Creators helped" /></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-md border border-border p-4"><p className="mb-3 text-xs font-black uppercase text-muted-foreground">Before</p>{["Random posting", "Second-guessing", "Learning alone"].map(x => <p key={x} className="mb-2 flex items-center gap-2 text-sm"><X className="size-4 text-primary" />{x}</p>)}</div><div className="rounded-md border border-success/30 bg-success/5 p-4"><p className="mb-3 text-xs font-black uppercase text-success">After</p>{["Clear content system", "Fast feedback", "Weekly momentum"].map(x => <p key={x} className="mb-2 flex items-center gap-2 text-sm"><Check className="size-4 text-success" />{x}</p>)}</div></div>
        </div>
      </div>
    </section>

    <section aria-label="Featured publications" className="border-y border-border bg-muted py-7"><p className="mb-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ideas featured across</p><div className="marquee-mask overflow-hidden"><div className="flex w-max animate-marquee gap-14 px-7 text-xl font-black text-muted-foreground/70">{["YOURSTORY", "Forbes India", "The Economic Times", "Inc42", "SOCIAL SAMOSA", "YOURSTORY", "Forbes India", "The Economic Times", "Inc42", "SOCIAL SAMOSA"].map((x,i) => <span key={`${x}-${i}`} className="whitespace-nowrap">{x}</span>)}</div></div></section>

    <section className="bg-primary px-4 py-16 text-primary-foreground sm:py-20"><div className="mx-auto max-w-4xl text-center"><Flame className="mx-auto size-10" /><p className="mt-3 text-xs font-black uppercase tracking-[0.18em]">Current cohort availability</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">156 of 200 seats are already gone.</h2><div className="mx-auto mt-7 max-w-2xl"><div className="mb-2 flex justify-between text-xs font-black"><span>156 FILLED</span><span>44 LEFT</span></div><div className="h-4 overflow-hidden rounded-full bg-primary-foreground/25"><div className="h-full w-[78%] rounded-full bg-primary-foreground" /></div></div><div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-bold"><span className="urgency"><Clock3 /> Offer can close early</span><span className="urgency"><Users /> One seat per registration</span></div><CtaButton className="mt-8 bg-foreground text-background hover:bg-foreground/90" children="Claim One of 44 Seats" /></div></section>

    <section className="px-4 py-16 sm:py-24"><div className="mx-auto max-w-5xl"><SectionHeading eyebrow="Simple from here" title="What happens next?" /><div className="grid gap-3 md:grid-cols-5">{[["Register", "Share your details"], ["Pay ₹3", "Complete secure payment"], ["Confirm", "Check WhatsApp"], ["Join", "Enter the community"], ["Build", "Take your first action"]].map(([title, copy], i) => <article key={title} className="relative rounded-lg border border-border p-5"><span className="text-4xl font-black text-primary/25">0{i+1}</span><h3 className="mt-4 font-black">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{copy}</p>{i < 4 && <ArrowRight className="absolute -right-3 top-8 z-10 hidden size-5 text-primary md:block" />}</article>)}</div></div></section>

    <section className="bg-muted px-4 py-16 sm:py-24"><div className="mx-auto max-w-3xl"><SectionHeading eyebrow="No doubts left behind" title="Frequently asked questions" /><Accordion type="single" collapsible className="rounded-lg border border-border bg-background px-5 sm:px-7">{faqs.map(([q,a],i) => <AccordionItem value={`faq-${i}`} key={q}><AccordionTrigger className="py-5 text-base font-black hover:no-underline">{q}</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

    <section id="checkout" className="scroll-mt-4 px-4 py-16 sm:py-24"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border-2 border-foreground bg-background shadow-editorial lg:grid-cols-[.85fr_1.15fr]">
      <div className="bg-foreground p-7 text-background sm:p-10"><p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Final step</p><h2 className="mt-3 text-4xl font-black leading-tight">Your seat is waiting.</h2><p className="mt-4 leading-7 text-background/70">Join the next wave of creators choosing action over overthinking.</p><div className="my-7 border-y border-background/15 py-6"><div className="flex items-end justify-between"><div><p className="text-sm text-background/60 line-through">₹999</p><p className="text-5xl font-black">₹3</p></div><span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-accent-foreground">LIMITED DROP</span></div></div><ul className="space-y-3 text-sm font-bold">{["Creator Circle access", "All 3 bonus resources", "Community feedback", "Instant next steps"].map(x => <li key={x} className="flex gap-2"><CheckCircle2 className="size-5 text-accent" />{x}</li>)}</ul></div>
      <div className="p-7 sm:p-10">{submitted ? <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><div className="grid size-16 place-items-center rounded-full bg-success text-success-foreground"><Check className="size-8" /></div><h3 className="mt-5 text-3xl font-black">You're on the list!</h3><p className="mt-3 max-w-sm leading-7 text-muted-foreground">Your details passed validation. Connect checkout to collect payment and send access.</p></div> : <form onSubmit={submitRegistration} noValidate>
        <h3 className="text-2xl font-black">Reserve your spot</h3><p className="mt-1 text-sm text-muted-foreground">Takes less than 60 seconds.</p>
        <div className="mt-7 space-y-5"><div><Label htmlFor="name">Full name</Label><Input id="name" name="name" autoComplete="name" placeholder="Your full name" className="mt-2 h-12" aria-invalid={!!errors.name} />{errors.name && <p className="mt-1.5 text-xs font-bold text-destructive">{errors.name}</p>}</div>
          <div><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="mt-2 h-12" aria-invalid={!!errors.email} />{errors.email && <p className="mt-1.5 text-xs font-bold text-destructive">{errors.email}</p>}</div>
          <div><Label htmlFor="whatsapp">WhatsApp number</Label><div className="mt-2 grid grid-cols-[auto_1fr]"><span className="grid h-12 place-items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-bold">+91</span><Input id="whatsapp" name="whatsapp" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel" placeholder="10-digit number" className="h-12 rounded-l-none" aria-invalid={!!errors.whatsapp} /></div>{errors.whatsapp && <p className="mt-1.5 text-xs font-bold text-destructive">{errors.whatsapp}</p>}</div>
          <div><div className="flex items-start gap-3"><Checkbox id="terms" checked={terms} onCheckedChange={(v) => setTerms(v === true)} className="mt-0.5" /><Label htmlFor="terms" className="text-sm font-normal leading-5 text-muted-foreground">I agree to the terms and consent to receive access updates on WhatsApp and email.</Label></div>{errors.terms && <p className="mt-1.5 text-xs font-bold text-destructive">{errors.terms}</p>}</div>
          {Object.entries(tracking).map(([key,value]) => <input key={key} type="hidden" name={key} value={value} />)}
          <Button type="submit" className="h-14 w-full text-base font-black shadow-cta">Continue Securely for ₹3 <ArrowRight className="size-5" /></Button>
        </div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-muted-foreground"><span><ShieldCheck className="mx-auto mb-1 size-4" />Secure payment</span><span><MessageCircleMore className="mx-auto mb-1 size-4" />WhatsApp confirm</span><span><Users className="mx-auto mb-1 size-4" />Limited spots</span></div>
      </form>}</div>
    </div><p className="mx-auto mt-7 max-w-xl text-center text-xs leading-5 text-muted-foreground">Creator Circle is an independent learning community. Results vary based on your effort and consistency.</p></section>

    <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">© 2026 Creator Circle · Made for people ready to begin.</footer>

    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 shadow-sticky backdrop-blur md:hidden"><div className="mx-auto grid max-w-lg grid-cols-[1fr_auto] items-center gap-3"><div className="min-w-0"><p className="text-xs font-bold text-muted-foreground"><span className="line-through">₹999</span> <span className="ml-1 text-xl font-black text-primary">₹3</span></p><p className="flex items-center gap-1 truncate text-[10px] font-black uppercase text-primary"><Flame className="size-3" /> Only 44 seats left</p></div><Button onClick={scrollToCheckout} className="h-12 shrink-0 px-5 font-black">Lock My Spot <ArrowRight /></Button></div></div>
  </main>;
}