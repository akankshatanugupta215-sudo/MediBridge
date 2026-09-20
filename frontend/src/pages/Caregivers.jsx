import { useEffect, useState } from "react";
import client from "../api/client";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import FormField, { inputClass } from "../components/FormField";
import { IconCaregiver } from "../components/icons";

const emptyForm = { name: "", email: "", phone: "", relation: "", accessLevel: "basic" };

export default function Caregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  async function load() {
    const { data } = await client.get("/caregivers");
    setCaregivers(data.caregivers);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await client.post("/caregivers", form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function revoke(id) {
    if (!confirm("Revoke this caregiver's access?")) return;
    await client.post(`/caregivers/${id}/revoke`);
    load();
  }

  async function remove(id) {
    if (!confirm("Remove this caregiver?")) return;
    await client.delete(`/caregivers/${id}`);
    load();
  }

  function copyLink(caregiver) {
    const link = `${window.location.origin}/caregiver-access/${caregiver.accessToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(caregiver._id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caregiver Access</h1>
          <p className="mt-1 text-sm text-slate-500">
            Share a controlled, read-only link with people you trust.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          + Add Caregiver
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Name">
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Caregiver's name"
              />
            </FormField>
            <FormField label="Relation">
              <input
                className={inputClass}
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                placeholder="Sibling, Friend, Nurse..."
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="caregiver@example.com"
              />
            </FormField>
            <FormField label="Phone">
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </FormField>
            <FormField label="Access level">
              <select
                className={inputClass}
                value={form.accessLevel}
                onChange={(e) => setForm({ ...form, accessLevel: e.target.value })}
              >
                <option value="basic">Basic — blood group, allergies, conditions, emergency contact</option>
                <option value="full">Full — includes current medications & notes</option>
              </select>
            </FormField>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Grant Access"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : caregivers.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <IconCaregiver className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No caregivers added yet</p>
          <p className="mt-1 text-xs text-slate-400">Give trusted people limited access to your medical info.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {caregivers.map((cg) => (
            <div key={cg._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{cg.name}</p>
                  <p className="text-xs text-slate-400">{cg.relation || "Caregiver"}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    cg.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cg.status === "active" ? "Active" : "Revoked"}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-500">
                {cg.email && <p>{cg.email}</p>}
                {cg.phone && <p>{cg.phone}</p>}
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {cg.accessLevel === "full" ? "Full access" : "Basic access"}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => copyLink(cg)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {copiedId === cg._id ? "Link copied!" : "Copy access link"}
                </button>
                {cg.status === "active" && (
                  <button
                    onClick={() => revoke(cg._id)}
                    className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                  >
                    Revoke
                  </button>
                )}
                <button
                  onClick={() => remove(cg._id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
