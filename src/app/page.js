"use client";

import Head from "next/head";
import { useEffect, useState } from "react";

export default function Home() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Redirect immediately
    window.location.href = "https://pesudiscord.netlify.app";

    // Fallback countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "https://pesudiscord.netlify.app";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white'>
      <Head>
        <title>PESU Discord - Redirecting</title>
        <meta
          httpEquiv='refresh'
          content='0;url=https://pesudiscord.netlify.app'
        />
      </Head>
      <div className='text-center p-8 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10'>
        <h1 className='text-4xl font-bold mb-4'>🚀 Project Moved!</h1>
        <p className='text-xl mb-6'>
          This project has been deprecated and moved to a new location.
        </p>
        <p className='text-lg mb-4'>
          You will be automatically redirected in{" "}
          <span className='font-bold text-yellow-300'>{countdown}</span>{" "}
          seconds...
        </p>
        <a
          href='https://pesudiscord.netlify.app'
          className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200'
        >
          Click here if you're not redirected automatically
        </a>
        <p className='text-sm mt-4 text-gray-300'>
          New URL:{" "}
          <span className='font-mono'>https://pesudiscord.netlify.app</span>
        </p>
      </div>
    </div>
  );
}
