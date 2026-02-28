"use client";

import { useState } from "react";
import type { ConceptSnapshot, MLText, MLStringArray } from "@/lib/schemas/concept";

interface SnapshotPanelProps {
  snapshot: ConceptSnapshot & { id?: string };
  onSaveVersion: () => void;
  saving: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{title}</h5>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full mr-1 mb-1">
      {children}
    </span>
  );
}

function textVal(val: MLText | undefined | null, showEn: boolean): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (showEn && val.en) return val.en;
  return val.original;
}

function arrayVal(val: MLStringArray | undefined | null, showEn: boolean): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (showEn && val.en) return val.en;
  return val.original;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="mb-1.5">
      <span className="text-xs text-slate-400">{label}: </span>
      <span className="text-xs text-slate-700">{value}</span>
    </div>
  );
}

export function SnapshotPanel({ snapshot, onSaveVersion, saving }: SnapshotPanelProps) {
  const [showEn, setShowEn] = useState(false);

  const hasContent = snapshot.premise || snapshot.genre || snapshot.characters?.length ||
    snapshot.world || snapshot.themes || snapshot.coreConflict;

  if (!hasContent) {
    return (
      <div className="text-xs text-slate-400 italic py-2">
        No concept data extracted yet. Start chatting to build your story bible.
      </div>
    );
  }

  const langLabel = snapshot.language === "vi" ? "Vietnamese" : snapshot.language === "en" ? "English" : null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        {langLabel && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{langLabel}</span>}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showEn}
            onChange={(e) => setShowEn(e.target.checked)}
            className="w-3 h-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-[10px] text-slate-500">Show English</span>
        </label>
      </div>

      {(snapshot.premise || snapshot.genre || snapshot.tone) && (
        <Section title="Story Bible">
          <Field label="Premise" value={textVal(snapshot.premise, showEn)} />
          <Field label="Genre" value={snapshot.genre || undefined} />
          <Field label="Tone" value={snapshot.tone || undefined} />
        </Section>
      )}

      {(snapshot.coreConflict || snapshot.stakes) && (
        <Section title="Conflict & Stakes">
          <Field label="Core Conflict" value={textVal(snapshot.coreConflict, showEn)} />
          <Field label="Stakes" value={textVal(snapshot.stakes, showEn)} />
        </Section>
      )}

      {snapshot.themes && (
        (() => {
          const items = arrayVal(snapshot.themes, showEn);
          return items.length > 0 ? (
            <Section title="Themes">
              <div className="flex flex-wrap">
                {items.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </Section>
          ) : null;
        })()
      )}

      {snapshot.characters && snapshot.characters.length > 0 && (
        <Section title="Characters">
          <div className="space-y-2">
            {snapshot.characters.map((c, i) => (
              <div key={c.name + i} className="bg-slate-50 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800">{c.name}</span>
                  {c.role && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                      {textVal(c.role, showEn)}
                    </span>
                  )}
                </div>
                {c.traits && (
                  (() => {
                    const items = arrayVal(c.traits, showEn);
                    return items.length > 0 ? (
                      <div className="flex flex-wrap mb-1">
                        {items.map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>
                    ) : null;
                  })()
                )}
                <Field label="Goal" value={textVal(c.goal, showEn) || undefined} />
                <Field label="Arc" value={textVal(c.arcHint, showEn) || undefined} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {snapshot.world && (
        <Section title="World">
          <Field label="Setting" value={textVal(snapshot.world.setting, showEn)} />
          {snapshot.world.rules && (
            (() => {
              const items = arrayVal(snapshot.world.rules, showEn);
              return items.length > 0 ? (
                <div className="mb-1.5">
                  <span className="text-xs text-slate-400">Rules:</span>
                  <ul className="ml-3 mt-0.5">
                    {items.map((r) => <li key={r} className="text-xs text-slate-700 list-disc">{r}</li>)}
                  </ul>
                </div>
              ) : null;
            })()
          )}
          {snapshot.world.factions && (
            (() => {
              const items = arrayVal(snapshot.world.factions, showEn);
              return items.length > 0 ? (
                <div className="mb-1.5">
                  <span className="text-xs text-slate-400">Factions:</span>
                  <div className="flex flex-wrap mt-0.5">{items.map((f) => <Tag key={f}>{f}</Tag>)}</div>
                </div>
              ) : null;
            })()
          )}
          {snapshot.world.conflicts && (
            (() => {
              const items = arrayVal(snapshot.world.conflicts, showEn);
              return items.length > 0 ? (
                <div className="mb-1.5">
                  <span className="text-xs text-slate-400">World Conflicts:</span>
                  <ul className="ml-3 mt-0.5">{items.map((c) => <li key={c} className="text-xs text-slate-700 list-disc">{c}</li>)}</ul>
                </div>
              ) : null;
            })()
          )}
        </Section>
      )}

      {snapshot.openQuestions && (
        (() => {
          const items = arrayVal(snapshot.openQuestions, showEn);
          return items.length > 0 ? (
            <Section title="Open Questions">
              <ul className="space-y-1">
                {items.map((q) => (
                  <li key={q} className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">{q}</li>
                ))}
              </ul>
            </Section>
          ) : null;
        })()
      )}

      <button
        onClick={onSaveVersion}
        disabled={saving}
        className="w-full mt-2 py-2 px-3 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Concept Version"}
      </button>
    </div>
  );
}
