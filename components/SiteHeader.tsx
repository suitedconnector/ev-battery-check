import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white text-sm font-bold"
          >
            EV
          </span>
          <span>Battery Check</span>
        </Link>
        <Link
          href="/check"
          className="text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Check my EV →
        </Link>
      </div>
    </header>
  );
}
