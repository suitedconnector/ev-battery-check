import { siteConfig } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted space-y-3">
        <p className="max-w-2xl">
          <strong className="text-ink">Preliminary information only.</strong>{" "}
          This tool provides a general, non-diagnostic assessment based on your
          answers. It cannot measure or confirm the condition of a
          high-voltage battery. Always confirm with a qualified EV technician
          before making repair or purchase decisions.
        </p>
        <p className="text-faint">
          For EV and hybrid owners across the U.S. © {new Date().getFullYear()}{" "}
          {siteConfig.brand}.
        </p>
      </div>
    </footer>
  );
}
