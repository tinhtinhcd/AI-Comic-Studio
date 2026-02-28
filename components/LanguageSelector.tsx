"use client";

interface LanguageSelectorProps {
  primaryLanguage: string;
  outputLanguage: string;
  onPrimaryChange: (val: string) => void;
  onOutputChange: (val: string) => void;
}

const OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

function Dropdown({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-slate-500 whitespace-nowrap">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function LanguageSelector({ primaryLanguage, outputLanguage, onPrimaryChange, onOutputChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <Dropdown label="Lang" value={primaryLanguage} onChange={onPrimaryChange} />
      <Dropdown label="Output" value={outputLanguage} onChange={onOutputChange} />
    </div>
  );
}
