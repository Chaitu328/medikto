import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-100 text-[#006591] flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[36px]">search_off</span>
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#006591] text-white font-bold text-sm shadow-md hover:bg-[#0ea5e9] transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
