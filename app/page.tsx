
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Code2,
  FileArchive,
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

    window.alert(
      'ZIP selected successfully. The import workflow will be connected to the workspace in the next step.',
    );

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#171a1a]">
      <header className="border-b border-[#e8e6df] bg-[#faf9f6]">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="Alphex Preview Studio home"
            className="block w-[210px] overflow-hidden sm:w-[255px]"
          >
            <div className="relative aspect-[3.6/1] w-full overflow-hidden">
              <img
                src="/alphex-preview-studio-logo.png"
                alt="Alphex Preview Studio"
                className="absolute left-0 top-[-54%] block h-auto w-full max-w-none"
              />
            </div>
          </Link>

          <div className="hidden items-center gap-2 text-sm text-[#73746f] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#ffb900]" />
            Browser-based workspace
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[620px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:py-24">
        <div className="max-w-[650px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e8e6df] bg-white px-3.5 py-2 text-xs font-medium text-[#55564f]">
            <span className="h-2 w-2 rounded-full bg-[#ffb900]" />
            YOUR WEB PROJECT, IN PREVIEW
          </div>

          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-[56px] lg:text-[68px]">
            Build less blindly.
            <br />
            <span className="text-[#c58b00]">See more clearly.</span>
          </h1>

          <p className="mt-6 max-w-[530px] text-base leading-7 text-[#73746f] sm:text-lg sm:leading-8">
            Bring your web project into one focused workspace. Explore files,
            edit code, and preview your pages across desktop, tablet, and
            mobile.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-[#ffb900] bg-[#ffb900] px-6 text-sm font-semibold text-[#171a1a] transition-colors hover:border-[#eda900] hover:bg-[#eda900]"
            >
              <Upload size={17} />
              Import a project
              <ArrowRight size={16} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(event) => handleImport(event.target.files?.[0])}
            />

            <a
              href="#workflow"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#e1dfd8] bg-white px-6 text-sm font-medium text-[#30312d] transition-colors hover:bg-[#f3f2ee]"
            >
              Explore the workspace
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#73746f]">
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-[#b17b00]" />
              ZIP project import
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-[#b17b00]" />
              Responsive preview
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-[#b17b00]" />
              Local project storage
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[570px]">
          <div className="absolute -inset-5 rounded-[32px] bg-[#ffb900]/10 blur-2xl" />

          <div className="relative overflow-hidden rounded-2xl border border-[#e5e2d9] bg-white shadow-[0_24px_80px_rgba(35,32,20,0.09)]">
            <div className="flex h-12 items-center justify-between border-b border-[#e8e6df] px-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e7e5df]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#e7e5df]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#e7e5df]" />
              </div>
              <span className="text-[11px] text-[#8b8b83]">
                preview.alphex.studio
              </span>
              <Code2 size={16} className="text-[#73746f]" />
            </div>

            <div className="grid min-h-[340px] grid-cols-[145px_1fr] sm:grid-cols-[175px_1fr]">
              <aside className="border-r border-[#e8e6df] bg-[#faf9f6] p-3">
                <div className="mb-4 flex items-center gap-2 px-1 text-[11px] font-semibold text-[#73746f]">
                  <FolderOpen size={14} />
                  PROJECT FILES
                </div>

                <div className="space-y-1 text-xs">
                  <div className="rounded-md bg-[#ffb900]/20 px-2 py-2 font-medium text-[#5d4500]">
                    index.html
                  </div>
                  <div className="rounded-md px-2 py-2 text-[#686961]">
                    styles.css
                  </div>
                  <div className="rounded-md px-2 py-2 text-[#686961]">
                    script.js
                  </div>
                  <div className="mt-3 border-t border-[#e8e6df] pt-3">
                    <div className="px-2 py-1.5 text-[#686961]">
                      <FolderOpen size={13} className="mr-2 inline" />
                      assets
                    </div>
                    <div className="px-5 py-1.5 text-[#93938b]">
                      image.svg
                    </div>
                  </div>
                </div>
              </aside>

              <div className="min-w-0 p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#73746f]">
                    Live preview
                  </span>
                  <div className="flex items-center gap-1.5 text-[#73746f]">
                    <Monitor size={15} />
                    <Tablet size={15} />
                    <Smartphone size={15} />
                  </div>
                </div>

                <div className="flex min-h-[230px] items-center justify-center rounded-xl border border-[#ece9e1] bg-[#faf9f6] p-4">
                  <div className="w-full max-w-[260px] rounded-xl border border-[#e8e6df] bg-white p-5 shadow-sm">
                    <div className="mb-4 h-2 w-12 rounded-full bg-[#ffb900]" />
                    <div className="h-3 w-4/5 rounded bg-[#202321]" />
                    <div className="mt-2 h-3 w-3/5 rounded bg-[#e6e5df]" />
                    <div className="mt-5 space-y-2">
                      <div className="h-2 w-full rounded bg-[#f0efea]" />
                      <div className="h-2 w-11/12 rounded bg-[#f0efea]" />
                      <div className="h-2 w-4/5 rounded bg-[#f0efea]" />
                    </div>
                    <div className="mt-5 h-8 w-24 rounded-lg bg-[#ffb900]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#e8e6df] px-4 py-3 text-[11px] text-[#73746f]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7baf79]" />
                Workspace concept
              </span>
              <span>Desktop · 1440 px</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="border-t border-[#e8e6df] bg-white"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#a47700]">
              A MORE FOCUSED WORKFLOW
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Everything starts with your project.
            </h2>
            <p className="mt-4 leading-7 text-[#73746f]">
              Import your files, inspect the structure, and prepare your
              project for responsive preview from one place.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Bring your files"
              description="Start with a ZIP archive of your website project."
            />
            <FeatureCard
              number="02"
              title="Explore and edit"
              description="Navigate your project structure and work with text files."
            />
            <FeatureCard
              number="03"
              title="Preview responsively"
              description="Check your page at desktop, tablet, and mobile widths."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e6df] bg-[#faf9f6]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-xs text-[#73746f] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>Alphex Preview Studio</span>
          <span>Designed for a clearer web workflow.</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[#e8e6df] bg-[#faf9f6] p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffb900]/20 text-xs font-semibold text-[#755400]">
        {number}
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#73746f]">{description}</p>
    </article>
  );
}
