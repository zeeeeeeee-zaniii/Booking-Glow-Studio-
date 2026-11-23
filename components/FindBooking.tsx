"use client";

import { useState } from "react";
import type { Booking } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/dates";

export default function FindBooking() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSearched(false);
    const clean = phone.trim();
    if (clean.replace(/\D/g, "").length < 10) {
      setError("Please enter the phone number you booked with (at least 10 digits).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?phone=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not look up your bookings. Please try again.");
        return;
      }
      setBookings(data.bookings as Booking[]);
      setSearched(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function cancel(booking: Booking) {
    if (!window.confirm(`Cancel your ${booking.service_name} booking on ${formatDate(booking.date)}?`)) return;
    setCancellingId(booking.id);
    setError(null);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id, phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not cancel this booking. Please try again.");
        return;
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b))
      );
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="booking-shell">
      <form onSubmit={search}>
        <div className="field">
          <label htmlFor="fb-phone">Phone number you booked with</label>
          <input
            id="fb-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0300 1234567"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Searching…" : "Find My Booking"}
        </button>
      </form>

      {error && (
        <div className="alert alert-error" role="alert" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}

      {searched && bookings.length === 0 && (
        <p className="empty-note">No bookings found for this number yet.</p>
      )}

      {bookings.length > 0 && (
        <div style={{ display: "grid", gap: "0.9rem", marginTop: "1.5rem" }}>
          {bookings.map((b) => (
            <div key={b.id} className="summary-box" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <strong>{b.service_name}</strong>{" "}
                  <span className={`pill pill-${b.status}`}>{b.status}</span>
                  <br />
                  <span style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
                    {formatDate(b.date)} at {formatTime(b.time)} · Ref {b.reference}
                  </span>
                </div>
                {(b.status === "pending" || b.status === "confirmed") && (
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    disabled={cancellingId === b.id}
                    onClick={() => cancel(b)}
                  >
                    {cancellingId === b.id ? "Cancelling…" : "Cancel Booking"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
