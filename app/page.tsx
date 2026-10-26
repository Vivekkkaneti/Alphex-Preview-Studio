
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Code2,
  FolderOpen,
  Monitor,
  Smartphone,
  Tablet,
  Upload,
} from 'lucide-react';

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImport(file?: File) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      window.alert('Please select a ZIP archive.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    window.alert('Open the workspace to import your project.');

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main
      className="min-h-screen bg-[#f8f8f6] text-[#171717]"
      style={{
        fontFamily:
          '"Avenir Next", Avenir, "Trebuchet MS", "Segoe UI", sans-serif',
      }}
    >
      {/* Header */}
      <header className="border-b border-[#e5e5e0] bg-white">
        <div className="mx-auto flex min-h-[88px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="Alphex Preview Studio home"
            className="block w-[225px] shrink-0 sm:w-[285px]"
          >
            <div className="relative h-[65px] w-full overflow-hidden bg-white sm:h-[72px]">
              <img
                src="/alphex-preview-studio-logo.png"
                alt="Alphex Preview Studio"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </Link>

          <span className="hidden items-center gap-2 text-sm text-[#777777] sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-[#ffc900]" />
            Browser-based workspace
          </span>
        </div>
      </header>

      {/* Original minimal hero */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-24 sm:px-8 sm:pt-32 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="mx-auto max-w-[1168px]">
          <div className="mb-9 flex items-center gap-2.5 text-[12px] font-medium tracking-[0.16em] text-[#777777] sm:mb-10">
            <span className="h-2 w-2 rounded-full bg-[#ffc900]" />
            WEB PROJECT WORKSPACE
          </div>

          <h1 className="max-w-[1000px] text-[48px] font-normal leading-[1.04] tracking-[-0.075em] sm:text-[66px] md:text-[82px] lg:text-[100px]">
            Your code.
            <br />
            Your preview.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">Your workspace.</span>
              <span
                aria-hidden="true"
                className="absolute bottom-[1px] left-0 right-0 z-0 h-[7px] bg-[#ffd21a] sm:h-[9px]"
              />
            </span>
          </h1>

          <div className="mt-10 flex flex-col items-start gap-6 sm:mt-11 sm:flex-row sm:items-center sm:gap-8">
            <p className="max-w-[490px] text-[15px] leading-[1.8] text-[#5f5f5f] sm:text-[17px]">
              A focused workspace to import website projects, inspect files,
              edit code, and preview responsive layouts without the clutter.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[52px] shrink-0 items-center gap-3 rounded-full bg-[#ffcc14] px-6 text-[13px] font-medium text-[#171717] transition-colors hover:bg-[#f2bd00] sm:px-7"
            >
              <Upload size={16} strokeWidth={1.8} />
              Import a project
              <ArrowUpRight size={17} strokeWidth={1.8} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(event) => handleImport(event.target.files?.[0])}
            />
          </div>

          <div className="mt-16 grid border-y border-[#deded9] sm:mt-20 sm:grid-cols-3">
            <Feature
              number="01"
              icon={<FolderOpen size={19} strokeWidth={1.6} />}
              title="Import your project"
              description="Bring your website files into one workspace."
            />
            <Feature
              number="02"
              icon={<Code2 size={19} strokeWidth={1.6} />}
              title="Inspect and edit"
              description="Browse files and make changes to your code."
            />
            <Feature
              number="03"
              icon={<Monitor size={19} strokeWidth={1.6} />}
              title="Preview every screen"
              description="Check your page across desktop, tablet, and mobile."
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-[#777777]">
            <span className="inline-flex items-center gap-2">
              <Check size={14} className="text-[#bd8e00]" />
              ZIP project import
            </span>
            <span className="inline-flex items-center gap-2">
              <Check size={14} className="text-[#bd8e00]" />
              Responsive preview
            </span>
            <span className="inline-flex items-center gap-2">
              <Check size={14} className="text-[#bd8e00]" />
              Local project storage
            </span>
          </div>

          <div className="mt-12 flex justify-end">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 text-[13px] text-[#626262] transition-colors hover:text-[#171717]"
            >
              Open workspace
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5e5e0] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-6 text-[11px] text-[#858585] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>Alphex Preview Studio</span>
          <span className="flex items-center gap-2">
            <Monitor size={13} />
            <Tablet size={13} />
            <Smartphone size={13} />
            Made for responsive workflows
          </span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="flex min-h-[140px] flex-col justify-between gap-5 border-b border-[#deded9] px-4 py-5 first:pl-0 sm:border-b-0 sm:border-r sm:px-6 sm:py-6 sm:first:pl-0 sm:last:border-r-0">
      <div className="flex items-center justify-between text-[#777777]">
        <span className="text-[11px] tabular-nums">{number}</span>
        {icon}
      </div>
      <div>
        <h2 className="text-[14px] font-medium tracking-[-0.02em]">{title}</h2>
        <p className="mt-1.5 max-w-[270px] text-[12px] leading-5 text-[#777777]">
          {description}
        </p>
      </div>
    </article>
  );
}
