"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IdeationChat } from "@/components/IdeationChat";
import { SnapshotPanel } from "@/components/SnapshotPanel";
import { LanguageSelector } from "@/components/LanguageSelector";
import type { ConceptSnapshot } from "@/lib/schemas/concept";

interface Outline {
  id: string;
  structure: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string | null;
  status: string;
}

interface Scene {
  id: string;
  heading: string;
  body: string;
}

interface ChapterContent {
  scenes: Scene[];
  script: string;
  version: number;
}

interface QCReport {
  issues: { type: string; location?: string; description: string; severity?: string }[];
  suggestions?: string[];
  score?: number;
}

interface Message {
  id: string;
  role: string;
  content: string;
}

export default function StudioPage({ params }: { params: Promise<{ seriesId: string }> }) {
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"ideation" | "production">("ideation");
  const [messages, setMessages] = useState<Message[]>([]);
  const [snapshot, setSnapshot] = useState<(ConceptSnapshot & { id?: string }) | null>(null);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [primaryLanguage, setPrimaryLanguage] = useState("auto");
  const [outputLanguage, setOutputLanguage] = useState("auto");
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null);
  const [chapterQC, setChapterQC] = useState<QCReport | null>(null);
  const [lastAction, setLastAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    params.then((p) => setSeriesId(p.seriesId));
  }, [params]);

  useEffect(() => {
    if (!seriesId) return;
    const load = async () => {
      const res = await fetch(`/api/series/${seriesId}`);
      const data = await res.json();
      if (!res.ok) return;
      if (data.title) setTitle(data.title);
      if (data.mode) setMode(data.mode as "ideation" | "production");
      setPrimaryLanguage(data.primaryLanguage || "auto");
      setOutputLanguage(data.preferredOutputLanguage || "auto");
      setMessages(data.messages || []);
      setSnapshot(data.snapshot || null);
      setOutline(data.outlines?.[0] || null);
      setChapters(data.chapters || []);
    };
    load();
  }, [seriesId]);

  const fetchChapterDetail = useCallback(
    async (chapterId: string) => {
      if (!seriesId) return;
      const res = await fetch(`/api/series/${seriesId}/chapters/${chapterId}`);
      const data = await res.json();
      if (!res.ok) return;
      setChapterContent({
        scenes: data.content?.scenes ?? [],
        script: data.content?.script ?? "",
        version: data.content?.version ?? 0,
      });
      setChapterQC(data.qc ?? null);
    },
    [seriesId]
  );

  useEffect(() => {
    if (seriesId && selectedChapter) fetchChapterDetail(selectedChapter);
    else {
      setChapterContent(null);
      setChapterQC(null);
    }
  }, [seriesId, selectedChapter, fetchChapterDetail]);

  const patchSeries = useCallback(async (field: string, value: string) => {
    if (!seriesId) return;
    await fetch(`/api/series/${seriesId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }, [seriesId]);

  const handlePrimaryLangChange = (val: string) => {
    setPrimaryLanguage(val);
    patchSeries("primaryLanguage", val);
  };

  const handleOutputLangChange = (val: string) => {
    setOutputLanguage(val);
    patchSeries("preferredOutputLanguage", val);
  };

  const handleSnapshotUpdate = (s: unknown) => {
    setSnapshot(s as (ConceptSnapshot & { id?: string }) | null);
  };

  const extractSnapshot = async () => {
    if (!seriesId) return;
    setLoading((l) => ({ ...l, snapshot: true }));
    try {
      const res = await fetch(`/api/series/${seriesId}/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extract: true }),
      });
      const data = await res.json();
      if (data.id) setSnapshot(data);
    } finally {
      setLoading((l) => ({ ...l, snapshot: false }));
    }
  };

  const saveConceptVersion = async () => {
    if (!seriesId || !snapshot) return;
    setLoading((l) => ({ ...l, saveSnapshot: true }));
    try {
      const res = await fetch(`/api/series/${seriesId}/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      const data = await res.json();
      if (data.id) setSnapshot(data);
    } finally {
      setLoading((l) => ({ ...l, saveSnapshot: false }));
    }
  };

  const generateOutline = async () => {
    if (!seriesId) return;
    setLoading((l) => ({ ...l, outline: true }));
    try {
      const res = await fetch(`/api/series/${seriesId}/outline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.id) setOutline(data);
    } finally {
      setLoading((l) => ({ ...l, outline: false }));
    }
  };

  const createChapter = async () => {
    if (!seriesId) return;
    setLoading((l) => ({ ...l, chapter: true }));
    try {
      const res = await fetch(`/api/series/${seriesId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outlineId: outline?.id }),
      });
      const data = await res.json();
      if (data.id) setChapters((prev) => [...prev, data]);
    } finally {
      setLoading((l) => ({ ...l, chapter: false }));
    }
  };

  const chapterIndex = selectedChapter ? chapters.find((c) => c.id === selectedChapter)?.number : null;

  const productionAction = async (
    key: string,
    endpoint: string,
    successAction: string
  ) => {
    if (!seriesId || selectedChapter == null || chapterIndex == null) return;
    setErrorMessage("");
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      const res = await fetch(`/api/production/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId, chapterIndex }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(data.error || res.statusText || "Action failed");
        setLastAction("Action failed");
        return;
      }
      setLastAction(successAction);
      await fetchChapterDetail(selectedChapter);
      if (endpoint === "approve") {
        const chRes = await fetch(`/api/series/${seriesId}/chapters`);
        const chData = await chRes.json();
        setChapters(Array.isArray(chData) ? chData : []);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Request failed");
      setLastAction("Action failed");
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  };

  const generateScenes = () => productionAction("scenes", "generate-scenes", "Scenes generated");
  const draftChapter = () => productionAction("draft", "draft-chapter", "Chapter drafted");
  const runCritic = () => productionAction("critic", "run-critic", "Critic run");
  const approveChapter = () => productionAction("approve", "approve", "Chapter approved");

  if (!seriesId) return <div className="p-8">Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
            ← Dashboard
          </Link>
          <h1 className="font-bold">{title || "Studio"}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("ideation")}
              className={`px-3 py-1 rounded text-sm ${mode === "ideation" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100"}`}
            >
              Ideation
            </button>
            <button
              onClick={() => setMode("production")}
              className={`px-3 py-1 rounded text-sm ${mode === "production" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100"}`}
            >
              Production
            </button>
          </div>
        </div>
        <LanguageSelector
          primaryLanguage={primaryLanguage}
          outputLanguage={outputLanguage}
          onPrimaryChange={handlePrimaryLangChange}
          onOutputChange={handleOutputLangChange}
        />
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Structure tree */}
        <aside className="w-64 border-r bg-white overflow-y-auto p-4">
          <h3 className="font-semibold mb-3">Structure</h3>
          {outline && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-1">Outline</p>
              <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto max-h-32">
                {outline.structure.slice(0, 200)}...
              </pre>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 mb-2">Chapters</p>
            <ul className="space-y-1">
              {chapters.map((ch) => (
                <li
                  key={ch.id}
                  className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer ${selectedChapter === ch.id ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                  onClick={() => setSelectedChapter(ch.id)}
                >
                  <span className="text-sm">
                    Ch {ch.number} {ch.title && `- ${ch.title}`}
                  </span>
                  <span className="text-xs text-slate-400">{ch.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center: Editor / Chat */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {mode === "ideation" ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-shrink-0 px-4 py-3 border-b bg-white">
                <h3 className="font-semibold text-slate-800">Ideation Chat</h3>
              </div>
              <IdeationChat
                seriesId={seriesId}
                messages={messages}
                onMessagesChange={setMessages}
                onSnapshotUpdate={handleSnapshotUpdate}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="font-semibold mb-4">Production</h3>
                {lastAction && (
                  <p className="text-xs text-slate-500 mb-2" data-activity>
                    Last action: <span className="font-medium text-slate-700">{lastAction}</span>
                  </p>
                )}
                {errorMessage && (
                  <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-red-700">{errorMessage}</span>
                    <button type="button" onClick={() => setErrorMessage("")} className="text-red-500 hover:text-red-700 text-xs font-medium">Dismiss</button>
                  </div>
                )}
                {selectedChapter ? (
                  <div>
                    <p className="text-slate-600 mb-4">
                      Chapter {chapters.find((c) => c.id === selectedChapter)?.number} selected.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button onClick={generateScenes} disabled={loading.scenes} className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 disabled:opacity-50">{loading.scenes ? "Generating…" : "Generate Scenes"}</button>
                      <button onClick={draftChapter} disabled={loading.draft} className="px-4 py-2 bg-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 disabled:opacity-50">{loading.draft ? "Drafting…" : "Draft Chapter"}</button>
                      <button onClick={runCritic} disabled={loading.critic} className="px-4 py-2 bg-amber-200 rounded-lg text-sm font-medium hover:bg-amber-300 disabled:opacity-50">{loading.critic ? "Running…" : "Run Critic"}</button>
                      <button onClick={approveChapter} disabled={loading.approve} className="px-4 py-2 bg-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-300 disabled:opacity-50">{loading.approve ? "Approving…" : "Approve"}</button>
                    </div>
                    {chapterContent && chapterContent.scenes.length > 0 && (
                      <section className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Scenes</h4>
                        <ul className="space-y-2">
                          {chapterContent.scenes.map((s) => (
                            <li key={s.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <div className="text-sm font-medium text-slate-800">{s.heading}</div>
                              <div className="text-xs text-slate-600 mt-1">{s.body}</div>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {chapterContent && chapterContent.script && (
                      <section>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Script (v{chapterContent.version})</h4>
                        <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto">{chapterContent.script}</pre>
                      </section>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Select a chapter from the left, or create one.</p>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right: AI actions + extracted memory */}
        <aside className="w-80 border-l bg-white overflow-y-auto p-4">
          <h3 className="font-semibold mb-3">AI Actions</h3>
          <div className="space-y-2 mb-4">
            <button
              onClick={extractSnapshot}
              disabled={loading.snapshot}
              className="w-full py-2 px-3 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 disabled:opacity-50"
            >
              {loading.snapshot ? "Extracting..." : "Extract Concept Snapshot"}
            </button>
            <button
              onClick={generateOutline}
              disabled={loading.outline}
              className="w-full py-2 px-3 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 disabled:opacity-50"
            >
              {loading.outline ? "Generating..." : "Generate Outline"}
            </button>
            <button
              onClick={createChapter}
              disabled={loading.chapter}
              className="w-full py-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
            >
              {loading.chapter ? "Creating..." : "Create Chapter"}
            </button>
          </div>

          {mode === "production" && chapterQC && (
            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold text-sm mb-2">QC Report</h4>
              {chapterQC.score != null && (
                <p className="text-xs text-slate-600 mb-2">Score: <span className="font-semibold">{chapterQC.score}</span>/100</p>
              )}
              {chapterQC.issues?.length > 0 && (
                <ul className="space-y-1 mb-2">
                  {chapterQC.issues.map((i, idx) => (
                    <li key={idx} className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded">
                      {i.location && <span className="font-medium">{i.location}: </span>}{i.description}
                    </li>
                  ))}
                </ul>
              )}
              {(chapterQC.suggestions?.length ?? 0) > 0 && (
                <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                  {chapterQC.suggestions?.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-3">Structured Memory</h4>
            {snapshot ? (
              <SnapshotPanel
                snapshot={snapshot}
                onSaveVersion={saveConceptVersion}
                saving={!!loading.saveSnapshot}
              />
            ) : (
              <p className="text-xs text-slate-400 italic">
                No concept data yet. Chat to start building structured memory.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
