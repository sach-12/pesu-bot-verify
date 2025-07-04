"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePersistentStore } from "@/utils/store/provider";
import ReactLoading from "react-loading";
import discordIcon from "@/assets/discordIcon.svg";

export default function Home() {
  const router = useRouter();
  const store = usePersistentStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store._hasHydrated || router === undefined) {
      return;
    }
    setLoading(false);
  }, [store._hasHydrated, router]);

  return (
    <div>
      <Head>
        <title>PESU Discord</title>
      </Head>
      {loading ? (
        <div className='flex flex-col items-center h-[85vh] my-auto justify-center'>
          <ReactLoading
            type='bubbles'
            color='#808183'
            height={100}
            width={100}
          />
          <h1 className='text-4xl text-pesu-c2 ml-10'>Loading</h1>
        </div>
      ) : store.user ? (
        <div className='h-[85vh] flex flex-col justify-center items-center'>
          <div className='w-fit flex flex-col items-center justify-center bg-pesu-c0 gap-4 rounded-lg border border-white/15 p-8'>
            <h1 className='text-4xl font-medium text-white'>
              Hey there, {store.user?.global_name}!
            </h1>
            <div className='flex flex-row'>
              {!store.user?.guild_info.in_guild && (
                <button
                  onClick={() => router.push("https://discord.gg/eZ3uFs2")}
                  className='bg-pesu-c1 text-white rounded-lg px-4 py-2 m-2 transition-colors hover:bg-white hover:text-pesu-c0'
                >
                  Join the PESU Discord Server
                </button>
              )}
              {store.user?.guild_info.is_verified && (
                <button
                  onClick={() => router.push("/event")}
                  className='bg-pesu-c1 text-white rounded-lg px-4 py-2 m-2 transition-colors hover:bg-white hover:text-pesu-c0'
                >
                  Post an Event
                </button>
              )}
              {!store.user?.guild_info.is_verified && (
                <button
                  onClick={() => router.push("/verify")}
                  className='bg-pesu-c1 text-white rounded-lg px-4 py-2 m-2 transition-colors hover:bg-white hover:text-pesu-c0'
                >
                  Verify yourself
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center h-[85vh] my-auto justify-center mx-4'>
          <div className='w-fit flex flex-col items-center justify-center bg-pesu-c0 gap-4 rounded-lg border border-white/15 p-8'>
            <h1 className='text-4xl text-white text-center tracking-wider'>
              Welcome to PESU Discord
            </h1>
            <button
              className='bg-pesu-c1 text-pesu-c2 rounded-lg px-4 py-2 m-2 transition-colors hover:bg-white hover:text-pesu-c0'
              onClick={() => {
                router.push("/login?returnTo=/");
              }}
            >
              <img
                src={discordIcon.src}
                alt=''
                className='h-6 w-6 inline-block'
              />
              <span className='ml-2'>Login with Discord</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
