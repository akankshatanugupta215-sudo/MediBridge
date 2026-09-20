import { useEffect, useState } from "react";
import client from "../api/client";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { IconAlert } from "../components/icons";

export default function QrCodePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await client.get("/qr");
    setData(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive() {
    setBusy(true);
    try {
      await client.post("/profile/qr/toggle");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function regenerate() {
    if (!confirm("Regenerate your QR code? The old code will stop working.")) return;
    setBusy(true);
    try {
      await client.post("/profile/qr/regenerate");
      await load();
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(data.emergencyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Emergency QR Code</h1>
        <p className="mt-1 text-sm text-slate-500">
          When scanned, this shows only critical, limited information — never your full account.
        </p>
      </div>

      {loading || !data ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="rounded-xl border border-slate-100 p-3">
              <img src={data.qrImage} alt="Emergency QR code" className="h-56 w-56" />
            </div>
            <span
              className={`mt-4 rounded-full px-3 py-1 text-xs font-semibold ${
                data.qrActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {data.qrActive ? "Active" : "Inactive"}
            </span>

            <div className="mt-6 flex w-full flex-wrap justify-center gap-3">
              <button
                onClick={toggleActive}
                disabled={busy}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {data.qrActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={regenerate}
                disabled={busy}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Regenerate
              </button>
              <a
                href={data.qrImage}
                download="medibridge-emergency-qr.png"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Download
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-slate-700">Emergency Link</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={data.emergencyUrl}
                  className="w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                />
                <button
                  onClick={copyLink}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Only critical info is shared</p>
                <p className="mt-0.5 text-sm text-amber-700">
                  Scanning the QR shows blood group, allergies, medical conditions, and your emergency contact only —
                  no login, medications list, or private documents.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Tips</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-500">
                <li>Print the QR and keep it in your wallet or on your phone's lock screen.</li>
                <li>Deactivate it any time without losing your saved profile.</li>
                <li>Regenerate it if you believe the code has been shared too widely.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
