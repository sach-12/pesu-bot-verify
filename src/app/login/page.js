"use client";

import Head from "next/head";
import { useEffect } from "react";
import { usePersistentStore } from "@/utils/store/provider";
import { useRouter, useSearchParams } from "next/navigation";
import ReactLoading from "react-loading";

const Login = () => {
  const store = usePersistentStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      !store._hasHydrated ||
      router === undefined ||
      searchParams === undefined
    ) {
      return;
    }

    if (store.user) {
      router.push("/");
      return;
    }

    const returnTo = searchParams.get("returnTo");
    const arr = new Uint8Array(20 / 2);
    window.crypto.getRandomValues(arr);
    const sessionId = Array.from(arr, (dec) =>
      ("0" + dec.toString(16)).padStart(2, "0")
    ).join("");
    const session = JSON.stringify({
      sessionId: sessionId,
      returnTo: returnTo || "/",
    });
    // base64 encode the state
    const base64Session = Buffer.from(session).toString("base64");
    store.setAuthSessionState(base64Session);

    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI);

    const url = `https://discord.com/api/oauth2/authorize?client_id=980529206276526100&redirect_uri=${redirectUri}&response_type=code&scope=identify&state=${sessionId}`;
    window.location.href = url;
  }, [store._hasHydrated, router, searchParams]);

  return (
    <div>
      <Head>
        <title>Login - PESU Discord</title>
      </Head>

      <div className="flex flex-col items-center h-[85vh] my-auto justify-center">
        <ReactLoading
          type="bubbles"
          color="#808183"
          height={100}
          width={100}
        />
        <h1 className="text-4xl text-pesu-c2">Redirecting</h1>
      </div>
    </div>
  );
};

export default Login;
