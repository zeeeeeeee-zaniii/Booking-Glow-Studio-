"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Booking, BookingStatus, Service } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { formatDate, formatTime, todayISO } from "@/lib/dates";

type Tab = "bookings" | "services" | "theme";
type AuthState = "checking" | "out" | "in";

interface Summary {
  todayCount: number;
  pendingCount: number;
  totalCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>("checking");
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("bookings");
  const [error, setError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<Summary>({ todayCount: 0, pendingCount: 0, totalCount: 0 });
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [svcForm, setSvcForm] = useState({ name: "", price_rs: "", duration_min: "", is_active: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingSvc, setSavingSvc] = useState(false);

  const [theme, setTheme] = useState<string>("rosewood");
  const [savingTheme, setSavingTheme] = useState<string | null>(null);

  const loadBookings = useCallback(async (): Promise<boolean> => {
    const res = await fetch(`/api/admin/bookings?today=${todayISO()}`);
    if (res.status === 401) return false;
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not load bookings.");
      return true;
    }
    setBookings(data.bookings as Booking[]);
    setSummary(data.summary as Summary);
    return true;
  }, []);

  const loadServices = useCallback(async () => {
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    if (res.ok) setServices(data.services as Service[]);
  }, []);

  const loadTheme = useCallback(async () => {
    const res = await fetch("/api/admin/theme");
    const data = await res.json();
    if (res.ok) setTheme(data.theme as string);
  }, []);

  const loadAll = useCallback(async () => {
    const signedIn = await loadBookings();
    if (!signedIn) {
      setAuth("out");
      return;
    }
    setAuth("in");
    await Promise.all([loadServices(), loadTheme()]);
  }, [loadBookings, loadServices, loadTheme]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error ?? "Could not sign in.");
        return;
      }
      setPasscode("");
      await loadAll();
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth("out");
    router.refresh();
  }

  async function setBookingStatus(booking: Booking, status: BookingStatus) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update the booking.");
        return;
      }
      await loadBookings();
    } catch {
      setError("Network error. Please try again.");
    }
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setSvcForm({
      name: service.name,
      price_rs: String(service.price_rs),
      duration_min: String(service.duration_min),
      is_active: service.is_active,
    });
  }

  function resetSvcForm() {
    setEditingId(null);
    setSvcForm({ name: "", price_rs: "", duration_min: "", is_active: true });
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingSvc(true);
    try {
      const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: svcForm.name,
          price_rs: Number(svcForm.price_rs),
          duration_min: Number(svcForm.duration_min),
          is_active: svcForm.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the service.");
        return;
      }
      resetSvcForm();
      await loadServices();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSavingSvc(false);
    }
  }

  async function deleteService(service: Service) {
    if (!window.confirm(`Delete "${service.name}"? Past bookings will keep showing its name.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete the service.");
        return;
      }
      if (editingId === service.id) resetSvcForm();
      await loadServices();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function chooseTheme(id: string) {
    setError(null);
    setSavingTheme(id);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the theme.");
        return;
      }
      setTheme(id);
      document.documentElement.dataset.theme = id;
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSavingTheme(null);
    }
  }

  if (auth === "checking") {
    return (
      <main className="admin-wrap">
        <p className="empty-note">Loading admin panel…</p>
      </main>
    );
  }

  if (auth === "out") {
    return (
      <main className="admin-wrap">
        <div className="admin-login card">
          <span className="logo" style={{ marginBottom: "0.5rem" }}>
            <span className="logo-mark">G</span> Glow Studio
          </span>
          <h2 style={{ margin: "0.75rem 0 0.4rem" }}>Admin Panel</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.25rem", fontSize: "0.94rem" }}>
            Enter the admin passcode to manage bookings, services and the site theme.
          </p>
          {loginError && (
            <div className="alert alert-error" role="alert">
              {loginError}
            </div>
          )}
          <form onSubmit={login}>
            <div className="field">
              <label htmlFor="passcode">Passcode</label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loggingIn} style={{ width: "100%" }}>
              {loggingIn ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p style={{ marginTop: "1.25rem", fontSize: "0.9rem" }}>
            <Link href="/" style={{ color: "var(--muted)" }}>
              ← Back to the website
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const visibleBookings = bookings.filter(
    (b) =>
      (!dateFilter || b.date === dateFilter) &&
      (!statusFilter || b.status === statusFilter)
  );

  return (
    <main className="admin-wrap">
      <div className="admin-head">
        <span className="logo">
          <span className="logo-mark">G</span> Glow Studio — Admin
        </span>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Link href="/" className="btn btn-ghost btn-small">
            View Website
          </Link>
          <button type="button" className="btn btn-ghost btn-small" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="tabs" role="tablist">
        {(["bookings", "services", "theme"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "bookings" ? "Bookings" : t === "services" ? "Services" : "Theme"}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <section>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-num">{summary.todayCount}</div>
              <div className="stat-label">Bookings today</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{summary.pendingCount}</div>
              <div className="stat-label">Pending requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{summary.totalCount}</div>
              <div className="stat-label">Total bookings</div>
            </div>
          </div>

          <div className="filters">
            <div className="field">
              <label htmlFor="f-date">Date</label>
              <input
                id="f-date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="f-status">Status</label>
              <select
                id="f-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {(dateFilter || statusFilter) && (
              <div className="field" style={{ justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => {
                    setDateFilter("");
                    setStatusFilter("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {visibleBookings.length === 0 ? (
            <p className="empty-note">No bookings match. New online bookings will appear here.</p>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>When</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.reference}</strong>
                      </td>
                      <td>
                        {b.customer_name}
                        <br />
                        <span style={{ color: "var(--muted)" }}>{b.phone}</span>
                      </td>
                      <td>{b.service_name}</td>
                      <td>
                        {formatDate(b.date)}
                        <br />
                        <span style={{ color: "var(--muted)" }}>{formatTime(b.time)}</span>
                      </td>
                      <td>
                        <span className={`pill pill-${b.status}`}>{b.status}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {b.status === "pending" && (
                            <button type="button" className="btn btn-primary btn-small" onClick={() => setBookingStatus(b, "confirmed")}>
                              Confirm
                            </button>
                          )}
                          {(b.status === "pending" || b.status === "confirmed") && (
                            <>
                              <button type="button" className="btn btn-ghost btn-small" onClick={() => setBookingStatus(b, "done")}>
                                Mark Done
                              </button>
                              <button type="button" className="btn btn-danger btn-small" onClick={() => setBookingStatus(b, "cancelled")}>
                                Cancel
                              </button>
                            </>
                          )}
                          {b.status === "cancelled" && (
                            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>—</span>
                          )}
                          {b.status === "done" && (
                            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "services" && (
        <section>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>{editingId ? "Edit service" : "Add a service"}</h3>
            <form onSubmit={saveService}>
              <div className="inline-form">
                <div className="field">
                  <label htmlFor="svc-name">Name</label>
                  <input
                    id="svc-name"
                    value={svcForm.name}
                    onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })}
                    placeholder="e.g. Signature Facial"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="svc-price">Price (Rs)</label>
                  <input
                    id="svc-price"
                    type="number"
                    min="0"
                    value={svcForm.price_rs}
                    onChange={(e) => setSvcForm({ ...svcForm, price_rs: e.target.value })}
                    placeholder="2500"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="svc-duration">Duration (min)</label>
                  <input
                    id="svc-duration"
                    type="number"
                    min="5"
                    step="5"
                    value={svcForm.duration_min}
                    onChange={(e) => setSvcForm({ ...svcForm, duration_min: e.target.value })}
                    placeholder="60"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingSvc}>
                  {savingSvc ? "Saving…" : editingId ? "Save Changes" : "Add Service"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem", flexWrap: "wrap" }}>
                <label className="switch-row">
                  <input
                    type="checkbox"
                    checked={svcForm.is_active}
                    onChange={(e) => setSvcForm({ ...svcForm, is_active: e.target.checked })}
                  />
                  Visible &amp; bookable on the website
                </label>
                {editingId && (
                  <button type="button" className="btn btn-ghost btn-small" onClick={resetSvcForm}>
                    Cancel editing
                  </button>
                )}
              </div>
            </form>
          </div>

          {services.length === 0 ? (
            <p className="empty-note">No services yet. Add your first service above.</p>
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>Rs {s.price_rs.toLocaleString()}</td>
                      <td>{s.duration_min} min</td>
                      <td>
                        <span className={`pill ${s.is_active ? "pill-confirmed" : "pill-done"}`}>
                          {s.is_active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-ghost btn-small" onClick={() => startEdit(s)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-danger btn-small" onClick={() => deleteService(s)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "theme" && (
        <section>
          <p style={{ color: "var(--muted)", marginBottom: "1.25rem", maxWidth: "36rem" }}>
            Pick a colour palette for the whole website — hero, buttons, cards, everything.
            The change is saved to the database and applies to every visitor right away.
          </p>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`card theme-card${theme === t.id ? " selected" : ""}`}
                onClick={() => chooseTheme(t.id)}
                disabled={savingTheme !== null}
              >
                <strong className="font-display" style={{ fontSize: "1.1rem" }}>
                  {t.name}
                </strong>
                {theme === t.id && <span className="pill pill-confirmed" style={{ marginLeft: "0.6rem" }}>Active</span>}
                <span className="swatches">
                  {t.swatches.map((hex) => (
                    <span key={hex} className="swatch" style={{ background: hex }} />
                  ))}
                </span>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{t.description}</span>
                {savingTheme === t.id && (
                  <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.88rem" }}>Saving…</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
