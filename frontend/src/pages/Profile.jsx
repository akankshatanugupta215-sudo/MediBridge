import { useEffect, useState } from "react";
import client from "../api/client";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import FormField, { inputClass } from "../components/FormField";

const BLOOD_GROUPS = ["Unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    bloodGroup: "Unknown",
    allergies: "",
    conditions: "",
    currentMedications: "",
    notes: "",
    emergencyContact: { name: "", phone: "", relation: "" },
  });

  useEffect(() => {
    client.get("/profile").then(({ data }) => {
      const p = data.profile;
      setProfile(p);
      setForm({
        bloodGroup: p.bloodGroup || "Unknown",
        allergies: (p.allergies || []).join(", "),
        conditions: (p.conditions || []).join(", "),
        currentMedications: p.currentMedications || "",
        notes: p.notes || "",
        emergencyContact: {
          name: p.emergencyContact?.name || "",
          phone: p.emergencyContact?.phone || "",
          relation: p.emergencyContact?.relation || "",
        },
      });
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { data } = await client.put("/profile", form);
      setProfile(data.profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("document", file);
      const { data } = await client.post("/profile/documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(data.profile);
      setFile(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Emergency Medical Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          This information can be shown on your emergency QR code and to caregivers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{message}</div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Core Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Blood Group">
              <select
                className={inputClass}
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Allergies (comma separated)">
              <input
                className={inputClass}
                placeholder="Penicillin, Peanuts"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              />
            </FormField>
            <FormField label="Medical Conditions (comma separated)">
              <input
                className={inputClass}
                placeholder="Asthma, Diabetes"
                value={form.conditions}
                onChange={(e) => setForm({ ...form, conditions: e.target.value })}
              />
            </FormField>
            <FormField label="Current Medications">
              <input
                className={inputClass}
                placeholder="Summary of current medications"
                value={form.currentMedications}
                onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Additional Notes">
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Anything else responders should know"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Emergency Contact
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Name">
              <input
                className={inputClass}
                value={form.emergencyContact.name}
                onChange={(e) =>
                  setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Phone">
              <input
                className={inputClass}
                value={form.emergencyContact.phone}
                onChange={(e) =>
                  setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Relation">
              <input
                className={inputClass}
                placeholder="Spouse, Parent, Friend..."
                value={form.emergencyContact.relation}
                onChange={(e) =>
                  setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })
                }
              />
            </FormField>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Medical Documents
        </h2>
        <p className="mb-4 text-xs text-slate-500">Upload prescriptions or reports (PDF, PNG, JPG, up to 5MB).</p>
        <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
          />
          <button
            type="submit"
            disabled={!file || uploading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {profile?.documents?.length > 0 && (
          <ul className="mt-4 space-y-2">
            {profile.documents.map((doc) => (
              <li key={doc.filename} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="truncate text-slate-700">{doc.originalName}</span>
                <a
                  href={doc.path}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 shrink-0 font-medium text-teal-600 hover:text-teal-700"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
