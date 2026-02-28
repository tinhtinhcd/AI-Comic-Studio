"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Series {
  id: string;
  title: string;
  mode: string;
  createdAt: string;
  _count?: { chapters: number; messages: number };
}

export default function DashboardPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const fetchSeries = async () => {
    const res = await fetch("/api/series");
    const data = await res.json();
    setSeries(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const createSeries = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), mode: "ideation" }),
      });
      const created = await res.json();
      if (created.id) {
        setNewTitle("");
        setSeries((prev) => [created, ...prev]);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="text-slate-600 mb-8">List series and create new.</p>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Series title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createSeries()}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
          />
          <button
            onClick={createSeries}
            disabled={creating}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create New"}
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : series.length === 0 ? (
          <p className="text-slate-500">No series yet. Create one above.</p>
        ) : (
          <ul className="space-y-3">
            {series.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                <div>
                  <h2 className="font-semibold">{s.title}</h2>
                  <p className="text-sm text-slate-500">
                    {s._count?.messages ?? 0} messages · {s._count?.chapters ?? 0} chapters · {s.mode}
                  </p>
                </div>
                <Link
                  href={`/studio/${s.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm"
                >
                  Open Studio
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
