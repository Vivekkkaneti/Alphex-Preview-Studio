
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <main className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors dark:bg-[#09090b] dark:text-neutral-100">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-white/10 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Code2 size={20} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                Alphex Preview Studio
              </h1>
              <p className="text-xs text-neutral-500">
                Web project workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setTheme((current) =>
                current === 'dark' ? 'light' : 'dark'
              )
            }
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 transition hover:bg-neutral-100 dark:border-white/10 dark:hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-74px)] max-w-5xl flex-col items-center justify-center px-5 py-16 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300">
            <FolderOpen size={30} />
          </div>

          <p className="mb-4 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-white/10">
            Your web project workspace
          </p>

          <h2 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Build. Preview.
            <span className="block text-violet-600 dark:text-violet-400">
              Refine.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-600 dark:text-neutral-400 sm:text-base">
            Bring your website files into one workspace. Inspect your project,
            edit code, and preview responsive layouts in one place.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                document.getElementById('project-import')?.click()
              }
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              <Upload size={17} />
              Get started
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                icon: FolderOpen,
                title: 'Project files',
                description: 'Bring your website files together.',
              },
              {
                icon: Code2,
                title: 'Code workspace',
                description: 'Inspect and edit project code.',
              },
              {
                icon: Monitor,
                title: 'Responsive preview',
                description: 'Prepare desktop, tablet, and mobile views.',
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 text-left dark:border-white/10 dark:bg-white/[0.02]"
                >
                  <Icon
                    size={20}
                    className="mb-4 text-violet-600 dark:text-violet-400"
                  />
                  <h3 className="text-sm font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-neutral-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center gap-5 text-xs text-neutral-500">
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

          <input
            id="project-import"
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                window.alert(
                  `Selected ${file.name}. Project importing will be enabled in the next development step.`
                );
              }

              event.target.value = '';
            }}
          />
        </section>

        <footer className="border-t border-neutral-200 px-5 py-4 text-center text-xs text-neutral-500 dark:border-white/10">
          Alphex Preview Studio · Your workspace for web projects
        </footer>
      </div>
    </main>
  );
}
