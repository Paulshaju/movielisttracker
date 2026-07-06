'use server'
import { HomeContainer } from "./components/HomeContainer";

import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
})

export default async function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col items-center justify-between p-4 lg:py-32 lg:px-16 bg-white dark:bg-black sm:items-start">
        <HomeContainer />
      </main>
    </div>
  );
}
