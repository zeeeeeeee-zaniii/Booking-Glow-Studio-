"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Booking, Service } from "@/lib/types";
import {
  TIME_SLOTS,
  addDays,
  formatDate,
  formatDateShort,
  formatTime,
  isSunday,
  todayISO,
} from "@/lib/dates";

interface Props {
  services: Service[];
  /** Set by the service cards' Book buttons to jump into the flow. */
  preselected: { serviceId: string; nonce: number } | null;
}

const STEP_LABELS = ["Service", "Date & Time", "Your Details", "Confirmed"];

export default function BookingFlow({ services, preselected }: Props) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Booking | null>(null);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const dates = useMemo(() => {
    const start = todayISO();
    return Array.from({ length: 14 }, (_, i) => addDays(start, i));
  }, []);

  // A service card's "Book" button preselects the service and jumps
  // straight to the date step.
  useEffect(() => {
    if (!preselected) return;
    setServiceId(preselected.serviceId);
    setCreated(null);
    setError(null);
    setStep(2);
  }, [preselected]);

  const loadAvailability = useCallback(async (svcId: string, d: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/availability?service_id=${encodeURIComponent(svcId)}&date=${encodeURIComponent(d)}`
      );
      const data = await res.json();
      setBookedSlots(res.ok && Array.isArray(data.booked) ? data.booked : []);
    } catch {
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (serviceId && date) {
      loadAvailability(serviceId, date);
    } else {
      setBookedSlots([]);
    }
  }, [serviceId, date, loadAvailability]);

  function slotPassed(d: string, t: string): boolean {
    if (d !== todayISO()) return false;
    const [h] = t.split(":").map(Number);
    const now = new Date();
    return h < now.getHours() || (h === now.getHours() && now.getMinutes() > 0);
  }

  function reset() {
    setStep(1);
    setServiceId(null);
    setDate(null);
    setTime(null);
    setName("");
    setPhone("");
    setError(null);
    setCreated(null);
  }

  async function confirmBooking() {
    if (!service || !date || !time) return;
    setError(null);
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (cleanPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service.id,
          date,
          time,
          customer_name: cleanName,
          phone: cleanPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save your booking. Please try again.");
        return;
      }
      setCreated(data.booking as Booking);
      setStep(4);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-shell">
      <div className="progress" aria-hidden="true">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const cls = step === n ? "active" : step > n ? "done" : "";
          return (
            <div key={label} className={`progress-step ${cls}`}>
              {n}. {label}
            </div>
          );
        })}
      </div>

      {error && step !== 4 && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Which service would you like?</h3>
          {services.length === 0 ? (
            <p className="empty-note">No services are available right now. Please check back soon.</p>
          ) : (
            <div className="choice-list">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`choice${serviceId === s.id ? " selected" : ""}`}
                  onClick={() => {
                    setServiceId(s.id);
                    setTime(null);
                    setStep(2);
                  }}
                >
                  <span className="choice-title">{s.name}</span>
                  <span className="choice-sub">
                    Rs {s.price_rs.toLocaleString()} · {s.duration_min} min
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: "0.4rem" }}>Pick a date</h3>
          <p style={{ color: "var(--muted)", marginBottom: "1rem", fontSize: "0.92rem" }}>
            {service ? `${service.name} · Rs ${service.price_rs.toLocaleString()} · ${service.duration_min} min` : ""}
            {" "}— we are closed on Sundays.
          </p>
          <div className="date-grid">
            {dates.map((d) => {
              const closed = isSunday(d);
              const info = formatDateShort(d);
              return (
                <button
                  key={d}
                  type="button"
                  className={`date-chip${date === d ? " selected" : ""}`}
                  disabled={closed}
                  onClick={() => {
                    setDate(d);
                    setTime(null);
                  }}
                >
                  <span className="dow">{closed ? "Closed" : info.weekday}</span>
                  <span className="dlabel">{info.label}</span>
                </button>
              );
            })}
          </div>

          {date && (
            <>
              <h3 style={{ margin: "1.6rem 0 0.8rem" }}>
                Available times — {formatDate(date)}
              </h3>
              {loadingSlots ? (
                <p style={{ color: "var(--muted)" }}>Checking availability…</p>
              ) : (
                <div className="slot-grid">
                  {TIME_SLOTS.map((t) => {
                    const booked = bookedSlots.includes(t);
                    const passed = slotPassed(date, t);
                    const disabled = booked || passed;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`slot-chip${time === t ? " selected" : ""}`}
                        disabled={disabled}
                        onClick={() => setTime(t)}
                      >
                        <span className="slot-time">{formatTime(t)}</span>
                        {booked && <span className="booked-label">Booked</span>}
                        {!booked && passed && <span className="booked-label">Passed</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="flow-nav">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!date || !time}
              onClick={() => setStep(3)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && service && date && time && (
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Almost done — your details</h3>
          <div className="summary-box">
            <dl>
              <dt>Service</dt>
              <dd>
                {service.name} (Rs {service.price_rs.toLocaleString()}, {service.duration_min} min)
              </dd>
              <dt>When</dt>
              <dd>
                {formatDate(date)} at {formatTime(time)}
              </dd>
            </dl>
          </div>
          <div className="field">
            <label htmlFor="bk-name">Your name</label>
            <input
              id="bk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayesha Khan"
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="bk-phone">Phone number</label>
            <input
              id="bk-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0300 1234567"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
            We will confirm your appointment on this number. Use the same number later in
            “Find My Booking” to see or cancel it.
          </p>
          <div className="flow-nav">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={submitting}
              onClick={confirmBooking}
            >
              {submitting ? "Booking…" : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && created && (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div className="alert alert-ok" style={{ textAlign: "left" }}>
            Your appointment request has been received. We will confirm it shortly on{" "}
            {created.phone}.
          </div>
          <p style={{ color: "var(--muted)" }}>Your booking reference is</p>
          <div className="reference-badge">{created.reference}</div>
          <p>
            <strong>{created.service_name}</strong>
            <br />
            {formatDate(created.date)} at {formatTime(created.time)}
          </p>
          <div className="flow-nav" style={{ justifyContent: "center" }}>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Book another appointment
            </button>
            <a className="btn btn-primary" href="#my-booking">
              Find My Booking
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
