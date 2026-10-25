
'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  Code2,
  FolderOpen,
  Monitor,
  Moon,
  Smartphone,
  Sun,
  Tablet,
  Upload,
} from 'lucide-react';

export default function HomePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <main className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f7f7f5] text-[#171717] transition-colors dark:bg-[#101010] dark:text-[#f5f5f5]">
        <header className="flex items-center justify-between border-b border-black/10 px-5 py-5 dark:border-white/10 sm:px-10">
          <a
            href="/"
            aria-label="Alphex Preview Studio home"
            className="text-xl font-light tracking-[-0.055em] sm:text-2xl"
          >
            alphex preview studio
          </a>

          <button
            type="button"
            onClick={() =>
              setTheme((current) =>
                current === 'dark' ? 'light' : 'dark'
              )
            }
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>

        <section className="mx-auto flex max-w-6xl flex-col px-5 pb-20 pt-20 sm:px-10 sm:pt-28 lg:pt-32">
          <div className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            <span className="h-2 w-2 rounded-full bg-[#facc15]" />
            Web project workspace
          </div>

          <h1 className="max-w-4xl text-5xl font-light leading-[1.08] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
            Your code.
            <br />
            Your preview.
            <br />
            <span className="font-normal">
              <span className="decoration-[#facc15] decoration-[8px] underline underline-offset-4">
                Your workspace.
              </span>
            </span>
          </h1>

          <div className="mt-8 flex max-w-2xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-sm leading-7 text-neutral-600 dark:text-neutral-400 sm:text-base">
              A focused workspace to import website projects, inspect files,
              edit code, and preview responsive layouts without the clutter.
            </p>

            <button
              type="button"
              onClick={() =>
                document.getElementById('project-import')?.click()
              }
              className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-[#facc15] px-6 py-3.5 text-sm font-medium text-[#171717] transition hover:bg-[#eab308]"
            >
              <Upload size={16} />
              Import a project
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="mt-20 grid border-y border-black/10 dark:border-white/10 sm:grid-cols-3">
            {[
              {
                number: '01',
                icon: FolderOpen,
                title: 'Bring your files',
                description:
                  'Start with a project folder or ZIP archive.',
              },
              {
                number: '02',
                icon: Code2,
                title: 'Work with your code',
                description:
                  'Browse your project and edit supported text files.',
              },
              {
                number: '03',
                icon: Monitor,
                title: 'Preview every screen',
                description:
                  'Inspect desktop, tablet, and mobile layouts.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.number}
                  className={`py-7 sm:px-6 sm:py-8 ${
                    index > 0
                      ? 'border-t border-black/10 dark:border-white/10 sm:border-l sm:border-t-0'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      {feature.number}
                    </span>
                    <Icon
                      size={19}
                      strokeWidth={1.5}
                      className="text-neutral-700 dark:text-neutral-300"
                    />
                  </div>

                  <h2 className="mt-7 text-base font-medium tracking-tight">
                    {feature.title}
                  </h2>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Designed for a focused workflow.</span>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Monitor size={14} /> Desktop
              </span>
              <span className="flex items-center gap-1.5">
                <Tablet size={14} /> Tablet
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone size={14} /> Mobile
              </span>
            </div>
          </div>

          <input
            id="project-import"
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                window.alert(
                  `Selected ${file.name}. Full project importing will be connected in a later step.`
                );
              }

              event.target.value = '';
            }}
          />
        </section>

        <footer className="flex flex-col gap-2 border-t border-black/10 px-5 py-6 text-xs text-neutral-500 dark:border-white/10 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <span className="text-sm font-light tracking-[-0.04em] text-neutral-800 dark:text-neutral-200">
            alphex preview studio
          </span>
          <span>A clearer way to work with web projects.</span>
        </footer>
      </div>
    </main>
  );
}
