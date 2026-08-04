"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { provisionOrganization, type AmxUid } from "@/lib/amexan";
import { Building2, Check, MapPin, ShieldCheck, Stethoscope, ChevronRight, Loader2 } from "lucide-react";

const C = {
  navy: "var(--sky-800)",
  sky: "var(--primary)",
  skyLight: "var(--sky-50)",
  white: "var(--surface-card)",
  border: "var(--surface-border)",
  text: "var(--text-primary)",
  textLight: "var(--text-muted)",
  green: "var(--green)",
  amber: "var(--amber)",
};

const ORG_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "teaching_hospital", label: "Teaching / Referral Hospital" },
  { value: "medical_school", label: "Medical School" },
  { value: "ngo", label: "NGO" },
  { value: "insurance", label: "Insurance" },
  { value: "research_institute", label: "Research Institute" },
  { value: "private_practice", label: "Private Practice" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const OWNERSHIP = ["Private", "Government", "Faith Based", "NGO", "University", "Military"];

const SERVICES = [
  "Emergency", "OPD", "IPD", "ICU", "Theatre", "Maternity", "Radiology",
  "Laboratory", "Pharmacy", "Dental", "Mental Health", "Physiotherapy", "Community Health",
];

const STEPS = [
  { id: 0, label: "Organization" },
  { id: 1, label: "Facility" },
  { id: 2, label: "Services" },
  { id: 3, label: "Confirm" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 12px", borderRadius: 8,
  border: `1px solid ${C.border}`, background: C.white, color: C.text,
  fontSize: 14, fontFamily: "'Inter', system-ui, sans-serif", outline: "none",
  boxSizing: "border-box",
};

export default function OrganizationSetupWizard() {
  const { user, session, refreshWorkspace } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [org, setOrg] = useState({
    name: "",
    type: "hospital",
    ownership: "Private",
    country: "",
    county: "",
    city: "",
  });
  const [facility, setFacility] = useState({ name: "", type: "hospital" });
  const [services, setServices] = useState<string[]>([]);

  const set = (patch: Partial<typeof org>) => setOrg(prev => ({ ...prev, ...patch }));

  function next() {
    if (step === 0 && !org.name.trim()) { setError("Organization name is required."); return; }
    if (step === 1 && !facility.name.trim()) { setError("Facility name is required."); return; }
    setError(null);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function back() { setError(null); setStep(s => Math.max(s - 1, 0)); }

  function toggleService(svc: string) {
    setServices(prev => prev.includes(svc) ? prev.filter(x => x !== svc) : [...prev, svc]);
  }

  async function create() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await provisionOrganization({
        firebaseUid: user.uid,
        actorId: (session.identity?.uid || user.uid) as AmxUid,
        actorName: user.displayName || user.email || "User",
        actorEmail: user.email || "",
        organizationName: org.name.trim(),
        organizationType: org.type,
        facilityName: facility.name.trim() || org.name.trim(),
        facilityType: facility.type,
        country: org.country,
        county: org.county,
        city: org.city,
        services,
      });
      await refreshWorkspace();
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create your organization. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${C.green}18`, color: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: "0 0 8px" }}>Your workspace is ready</h2>
        <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 20px" }}>Your organization, facility, and dashboard have been provisioned.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: C.sky, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Open Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, width: "100%", margin: "0 auto" }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        {STEPS.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
              background: step >= s.id ? C.sky : C.border,
              color: step >= s.id ? "#fff" : C.textLight,
            }}>
              {step > s.id ? <Check size={13} /> : s.id + 1}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: step >= s.id ? C.text : C.textLight, whiteSpace: "nowrap" }}>{s.label}</span>
            {s.id < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.id ? C.sky : C.border, borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        {step === 0 && (
          <div>
            <StepTitle icon={<Building2 size={16} />} title="What are you creating?" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {ORG_TYPES.map(t => (
                <button key={t.value} onClick={() => set({ type: t.value })}
                  style={{
                    padding: "10px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", fontSize: 12,
                    border: org.type === t.value ? `1.5px solid ${C.sky}` : `1px solid ${C.border}`,
                    background: org.type === t.value ? C.skyLight : C.white, color: C.text, fontFamily: "inherit",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
            <Field label="Organization Name">
              <input style={inputStyle} placeholder="e.g. AMEXAN Medical Centre" value={org.name} onChange={e => set({ name: e.target.value })} />
            </Field>
            <Field label="Ownership">
              <select style={inputStyle} value={org.ownership} onChange={e => set({ ownership: e.target.value })}>
                {OWNERSHIP.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Country"><input style={inputStyle} placeholder="Kenya" value={org.country} onChange={e => set({ country: e.target.value })} /></Field>
              <Field label="County"><input style={inputStyle} placeholder="Kisii" value={org.county} onChange={e => set({ county: e.target.value })} /></Field>
            </div>
            <Field label="City / Town"><input style={inputStyle} placeholder="Kisii Town" value={org.city} onChange={e => set({ city: e.target.value })} /></Field>
          </div>
        )}

        {step === 1 && (
          <div>
            <StepTitle icon={<MapPin size={16} />} title="Create your facility" />
            <p style={{ fontSize: 12, color: C.textLight, margin: "0 0 16px", lineHeight: 1.6 }}>
              The facility is where care is delivered. We&apos;ll provision it automatically once you continue.
            </p>
            <Field label="Facility Name">
              <input style={inputStyle} placeholder="e.g. Kisii Teaching and Referral Hospital" value={facility.name} onChange={e => setFacility(prev => ({ ...prev, name: e.target.value }))} />
            </Field>
            <Field label="Facility Type">
              <select style={inputStyle} value={facility.type} onChange={e => setFacility(prev => ({ ...prev, type: e.target.value }))}>
                <option value="hospital">Hospital</option>
                <option value="teaching_hospital">Teaching / Referral Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="dispensary">Dispensary</option>
                <option value="specialist_center">Specialist Center</option>
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepTitle icon={<Stethoscope size={16} />} title="What services does your facility provide?" />
            <p style={{ fontSize: 12, color: C.textLight, margin: "0 0 16px" }}>Select all that apply. This configures your HMIS modules.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SERVICES.map(svc => {
                const on = services.includes(svc);
                return (
                  <button key={svc} onClick={() => toggleService(svc)}
                    style={{
                      padding: "10px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", fontSize: 12,
                      border: on ? `1.5px solid ${C.sky}` : `1px solid ${C.border}`,
                      background: on ? C.skyLight : C.white, color: C.text, fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, border: on ? `1.5px solid ${C.sky}` : `1px solid ${C.border}`, background: on ? C.sky : C.white, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                      {on ? <Check size={10} /> : null}
                    </span>
                    {svc}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <StepTitle icon={<ShieldCheck size={16} />} title="Confirm your organization" />
            <div style={{ background: C.skyLight, border: `1px solid ${C.sky}25`, borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>{org.name || "Your Organization"}</strong> <span style={{ color: C.textLight }}>· {ORG_TYPES.find(t => t.value === org.type)?.label}</span></div>
              <div style={{ color: C.textLight, fontSize: 12 }}>
                {[org.country, org.county, org.city].filter(Boolean).join(", ") || "Location not set"} · {org.ownership} ownership
              </div>
              <div style={{ color: C.textLight, fontSize: 12, marginTop: 4 }}>
                Facility: <strong>{facility.name || org.name}</strong>
              </div>
              <div style={{ color: C.textLight, fontSize: 12 }}>
                Services: {services.length ? services.join(", ") : "None selected"}
              </div>
            </div>
            <p style={{ fontSize: 12, color: C.textLight, margin: "16px 0 0", lineHeight: 1.6 }}>
              On continue, AMEXAN automatically provisions your <strong>organization</strong>, <strong>owner membership</strong>, <strong>facility</strong>, <strong>employment</strong>, and <strong>dashboard</strong>. You&apos;ll land directly on your workspace.
            </p>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: "10px 12px", borderRadius: 8, background: "#fee2e2", color: "#b91c1c", fontSize: 12 }}>{error}</div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button onClick={back} disabled={step === 0 || loading}
            style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next}
              style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: C.sky, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={create} disabled={loading}
              style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: C.navy, color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {loading ? "Provisioning..." : "Create Organization"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ color: C.sky }}>{icon}</span>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, margin: 0 }}>{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
