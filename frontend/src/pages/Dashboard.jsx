import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { IconPill, IconAlert, IconProfile, IconCaregiver, IconQr, IconCheck } from "../components/icons";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's a quick overview of your medical readiness.
        </p>
      </div>

      {loading || !stats ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Active Medicines" value={stats.activeMedicines} icon={IconPill} tone="teal" />
            <StatCard label="Known Allergies" value={stats.knownAllergies} icon={IconAlert} tone="amber" />
            <StatCard label="Medical Conditions" value={stats.medicalConditions} icon={IconProfile} tone="slate" />
            <StatCard
              label="Emergency Contact"
              value={stats.emergencyContactSet ? "Set" : "Missing"}
              icon={IconCheck}
              tone={stats.emergencyContactSet ? "emerald" : "rose"}
            />
            <StatCard
              label="Emergency QR"
              value={stats.qrActive ? "Active" : "Inactive"}
              icon={IconQr}
              tone={stats.qrActive ? "emerald" : "rose"}
            />
            <StatCard label="Caregivers" value={stats.caregiversActive} icon={IconCaregiver} tone="teal" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink to="/profile" title="Update Profile" desc="Blood group, allergies & conditions" />
            <QuickLink to="/medicines" title="Manage Medicines" desc="Add or update your medications" />
            <QuickLink to="/caregivers" title="Manage Caregivers" desc="Share controlled access" />
            <QuickLink to="/qr-code" title="View Emergency QR" desc="Show or download your QR code" />
          </div>

          {!stats.emergencyContactSet && (
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Add an emergency contact</p>
                <p className="mt-0.5 text-sm text-amber-700">
                  Your profile is missing an emergency contact. Add one so responders can reach someone quickly.{" "}
                  <Link to="/profile" className="font-semibold underline">
                    Update profile
                  </Link>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

function QuickLink({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </Link>
  );
}
