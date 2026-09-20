import { useEffect, useState } from "react";
import client from "../api/client";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import FormField, { inputClass } from "../components/FormField";
import { IconPill } from "../components/icons";

const emptyForm = { name: "", dosage: "", frequency: "", startDate: "", endDate: "", status: "active", notes: "" };

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await client.get("/medicines");
    setMedicines(data.medicines);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(med) {
    setForm({
      name: med.name || "",
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      startDate: med.startDate ? med.startDate.slice(0, 10) : "",
      endDate: med.endDate ? med.endDate.slice(0, 10) : "",
      status: med.status,
      notes: med.notes || "",
    });
    setEditingId(med._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await client.put(`/medicines/${editingId}`, form);
      } else {
        await client.post("/medicines", form);
      }
      await load();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(med) {
    await client.put(`/medicines/${med._id}`, { status: med.status === "active" ? "inactive" : "active" });
    load();
  }

  async function remove(id) {
    if (!confirm("Remove this medicine from your list?")) return;
    await client.delete(`/medicines/${id}`);
    load();
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medication Manager</h1>
          <p className="mt-1 text-sm text-slate-500">Track dosages, schedules, and active status.</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          + Add Medicine
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">{editingId ? "Edit Medicine" : "New Medicine"}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Medicine name">
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Paracetamol"
              />
            </FormField>
            <FormField label="Dosage">
              <input
                className={inputClass}
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="500 mg"
              />
            </FormField>
            <FormField label="Frequency">
              <input
                className={inputClass}
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                placeholder="Twice a day"
              />
            </FormField>
            <FormField label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
            <FormField label="Start date">
              <input
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="End date">
              <input
                type="date"
                className={inputClass}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Notes">
            <input
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Take after food"
            />
          </FormField>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add Medicine"}
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
      ) : medicines.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Medicine</th>
                <th className="px-4 py-3 font-medium">Dosage</th>
                <th className="px-4 py-3 font-medium">Frequency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map((med) => (
                <tr key={med._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{med.name}</td>
                  <td className="px-4 py-3 text-slate-600">{med.dosage || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{med.frequency || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(med)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        med.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {med.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(med)}
                      className="mr-3 text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(med._id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <IconPill className="mb-3 h-8 w-8 text-slate-300" />
      <p className="text-sm font-medium text-slate-600">No medicines added yet</p>
      <p className="mt-1 text-xs text-slate-400">Keep track of what you're taking and when.</p>
      <button onClick={onAdd} className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
        Add your first medicine
      </button>
    </div>
  );
}
