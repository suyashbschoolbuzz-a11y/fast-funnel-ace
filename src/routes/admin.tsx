import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, IndianRupee, LogOut, RefreshCw, Save, Search, Settings2, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminDashboard, loginAdmin, logoutAdmin, updateAdminSettings } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Admin — The Content Desk" },
    { name: "description", content: "Private Content Desk offer and payment administration." },
    { property: "og:title", content: "Admin — The Content Desk" },
    { property: "og:description", content: "Private Content Desk administration." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminPage,
});

type Dashboard = Awaited<ReturnType<typeof getAdminDashboard>>;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function AdminPage() {
  const login = useServerFn(loginAdmin);
  const logout = useServerFn(logoutAdmin);
  const loadDashboard = useServerFn(getAdminDashboard);
  const saveSettings = useServerFn(updateAdminSettings);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function refresh() {
    setChecking(true);
    setError("");
    try { setDashboard(await loadDashboard()); } catch { setDashboard(null); } finally { setChecking(false); }
  }

  useEffect(() => { void refresh(); }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      await login({ data: { username: String(form.get("username") ?? ""), password: String(form.get("password") ?? "") } });
      await refresh();
    } catch { setError("Incorrect ID or password."); }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dashboard) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await saveSettings({ data: { price: Number(form.get("price")), months: Number(form.get("months")), groupUrl: String(form.get("groupUrl") ?? "") } });
      await refresh();
    } catch { setError("Please check the price, duration, and WhatsApp invite link."); } finally { setSaving(false); }
  }

  const filteredOrders = useMemo(() => {
    if (!dashboard) return [];
    const query = search.trim().toLowerCase();
    if (!query) return dashboard.orders;
    return dashboard.orders.filter((order) => [order.customer_name, order.customer_email, order.customer_phone, order.order_id, order.status].some((value) => value.toLowerCase().includes(query)));
  }, [dashboard, search]);

  if (checking && !dashboard) return <main className="grid min-h-screen place-items-center bg-background text-foreground"><RefreshCw className="size-8 animate-spin text-primary" aria-label="Loading admin" /></main>;

  if (!dashboard) return <main className="grid min-h-screen place-items-center bg-hero px-4 text-foreground"><section className="w-full max-w-md rounded-lg border border-primary/35 bg-card p-7 shadow-neon sm:p-9"><div className="cta-gradient mb-5 grid size-12 place-items-center rounded-md"><ShieldCheck /></div><p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Private access</p><h1 className="mt-2 text-3xl font-black">Admin sign in</h1><p className="mt-2 text-sm text-muted-foreground">Manage your offer and review payment activity.</p><form onSubmit={handleLogin} className="mt-7 space-y-5"><div><Label htmlFor="username">Admin ID</Label><Input id="username" name="username" autoComplete="username" required maxLength={80} className="mt-2 h-12" /></div><div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} className="mt-2 h-12" /></div>{error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}<Button type="submit" className="cta-gradient h-12 w-full font-black">Sign in securely</Button></form></section></main>;

  const summaryCards = [
    ["Total payments", dashboard.summary.total, Users],
    ["Paid", dashboard.summary.paid, CheckCircle2],
    ["Pending", dashboard.summary.pending, Clock3],
    ["Revenue", `₹${dashboard.summary.revenue.toLocaleString("en-IN")}`, IndianRupee],
  ] as const;

  return <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-10"><div className="mx-auto max-w-7xl"><header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">The Content Desk</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Admin overview</h1><p className="mt-2 text-muted-foreground">Offer controls and Cashfree payment activity.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void refresh()}><RefreshCw /> Refresh</Button><Button variant="ghost" onClick={async () => { await logout(); setDashboard(null); }}><LogOut /> Sign out</Button></div></header>
    <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{summaryCards.map(([label, value, Icon]) => <article key={label} className="rounded-lg border border-border bg-card p-5 shadow-card"><Icon className="size-5 text-accent" /><p className="mt-5 text-2xl font-black sm:text-3xl">{value}</p><p className="mt-1 text-xs font-bold uppercase text-muted-foreground">{label}</p></article>)}</section>
    <section className="mt-7 rounded-lg border border-border bg-card p-5 sm:p-7"><div className="mb-6 flex items-center gap-3"><Settings2 className="text-primary" /><div><h2 className="text-xl font-black">Offer settings</h2><p className="text-sm text-muted-foreground">Changes update the landing page and new Cashfree orders.</p></div></div><form onSubmit={handleSave} className="grid gap-5 md:grid-cols-[.6fr_.6fr_1.8fr_auto] md:items-end"><div><Label htmlFor="price">Price (₹)</Label><Input id="price" name="price" type="number" min={1} max={100000} step={1} defaultValue={dashboard.settings.price} className="mt-2 h-11" /></div><div><Label htmlFor="months">Access months</Label><Input id="months" name="months" type="number" min={1} max={24} defaultValue={dashboard.settings.months} className="mt-2 h-11" /></div><div><Label htmlFor="groupUrl">WhatsApp group link</Label><Input id="groupUrl" name="groupUrl" type="url" defaultValue={dashboard.settings.groupUrl} placeholder="https://chat.whatsapp.com/..." className="mt-2 h-11" /></div><Button type="submit" disabled={saving} className="cta-gradient h-11 font-black"><Save /> {saving ? "Saving…" : "Save"}</Button></form>{error && <p role="alert" className="mt-4 text-sm font-bold text-destructive">{error}</p>}</section>
    <section className="mt-7 overflow-hidden rounded-lg border border-border bg-card"><div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><h2 className="text-xl font-black">Payment summary</h2><p className="text-sm text-muted-foreground">Showing {filteredOrders.length} of {dashboard.orders.length} orders.</p></div><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search payments" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone or status" className="h-10 pl-9" /></div></div><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Contact</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead>Paid / access</TableHead></TableRow></TableHeader><TableBody>{filteredOrders.map((order) => <TableRow key={order.order_id}><TableCell><p className="font-bold">{order.customer_name}</p><p className="max-w-48 truncate text-xs text-muted-foreground">{order.order_id}</p></TableCell><TableCell><p>{order.customer_phone}</p><p className="text-xs text-muted-foreground">{order.customer_email}</p></TableCell><TableCell className="font-black">₹{order.amount_inr.toLocaleString("en-IN")}</TableCell><TableCell><span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${order.status === "paid" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>{order.status}</span></TableCell><TableCell className="whitespace-nowrap text-xs">{formatDate(order.created_at)}</TableCell><TableCell className="whitespace-nowrap text-xs"><p>{formatDate(order.paid_at)}</p>{order.access_expires_at && <p className="mt-1 text-muted-foreground">Until {formatDate(order.access_expires_at)}</p>}</TableCell></TableRow>)}{filteredOrders.length === 0 && <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">No payments match this search.</TableCell></TableRow>}</TableBody></Table></section>
  </div></main>;
}