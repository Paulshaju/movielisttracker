"use server";
import { Video } from "lucide-react";
import { HomeContainer } from "./components/HomeContainer";

export default async function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 h-9 w-9 rounded-md p-2 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-lg font-semibold tracking-tight">Cinelog</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Track what you want to watch, and what you already have.
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-1 w-full flex-col items-center justify-between p-4 lg:py-16 lg:px-16 bg-white dark:bg-black sm:items-start">
        <HomeContainer />
      </main>
    </div>
  );
}
