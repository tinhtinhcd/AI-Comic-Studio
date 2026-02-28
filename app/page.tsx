import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">AI Story Studio</h1>
      <p className="text-slate-600 mb-8">Ideation & production for your stories</p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
