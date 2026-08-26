import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black transition-colors duration-300">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">BotHandlers</div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start mx-auto shadow-sm">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to <span className="text-blue-600 dark:text-blue-400">BotHandlers</span>
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            The PagerDuty for AI Agents. Route AI exceptions and policy boundaries to the right human operator.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 md:w-[158px]"
            href="/dashboard"
          >
            Go to Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
