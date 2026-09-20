import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import { IconCross, IconAlert, IconPill } from "../components/icons";

export default function CaregiverAccessView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get(`/caregiver-access/${token}`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "This access link is invalid or has been revoked."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-teal-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
            <IconCross className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-slate-900">Caregiver Access</h1>
          <p className="text-xs text-slate-500">Shared via MediBridge</p>
        </div>

        {loading && <p className="text-center text-sm text-slate-500">Loading...</p>}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
            <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-4">
            <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Patient</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{data.patientName}</p>
              <span className="mt-2 inline-block rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                {data.caregiverAccessLevel === "full" ? "Full access" : "Basic access"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="Blood Group" value={data.bloodGroup} />
              <InfoCard
                label="Emergency Contact"
                value={data.emergencyContact?.phone || "Not provided"}
                sub={data.emergencyContact?.name}
              />
            </div>

            <InfoList label="Allergies" items={data.allergies} emptyText="No known allergies" />
            <InfoList label="Medical Conditions" items={data.conditions} emptyText="No conditions listed" />

            {data.caregiverAccessLevel === "full" && (
              <>
                {data.currentMedications && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Current Medications
                    </p>
                    <p className="text-sm text-slate-700">{data.currentMedications}</p>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <IconPill className="h-3.5 w-3.5" /> Active Medicines
                  </p>
                  {data.medicines?.length > 0 ? (
                    <ul className="space-y-2">
                      {data.medicines.map((m) => (
                        <li key={m._id} className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{m.name}</span>
                          <span className="text-slate-500">
                            {m.dosage} {m.frequency && `· ${m.frequency}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">No active medicines</p>
                  )}
                </div>

                {data.notes && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
                    <p className="text-sm text-slate-700">{data.notes}</p>
                  </div>
                )}
              </>
            )}

            <p className="pt-2 text-center text-[11px] text-slate-400">
              You have controlled, read-only access shared by the patient.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function InfoList({ label, items, emptyText }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">{emptyText}</p>
      )}
    </div>
  );
}
