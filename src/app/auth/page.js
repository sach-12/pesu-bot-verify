"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { usePersistentStore } from "@/utils/store/provider";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ReactLoading from "react-loading";

const Auth = () => {
  const store = usePersistentStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("Loading");
  const [errorText, setErrorText] = useState(null);

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

    const error = searchParams.get("error");
    if (error) {
      setText("Oops, looks like a Discord authentication error");
      const errorDescription = searchParams.get("error_description");
      setErrorText(decodeURIComponent(errorDescription));
      setLoading(false);
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
      setText("Invalid request");
      setErrorText("Missing code or state parameter");
      setLoading(false);
      return;
    }
    const authSessionState = store.authSessionState;
    if (!authSessionState) {
      setText("Invalid request");
      setErrorText("Invalid session");
      setLoading(false);
      return;
    }
    const decodedSession = Buffer.from(authSessionState, "base64").toString("ascii");
    const parsedSession = JSON.parse(decodedSession);
    // check if session id matches
    if (parsedSession.sessionId !== state) {
      setText("You're not supposed to be here");
      setLoading(false);
      return;
    } else {
      setText("Just a sec");
      const tokenUrl = `/api/token?code=${code}`;
      axios
        .get(tokenUrl)
        .then(() => {
          setText("Almost there");
          const userUrl = "/api/user";
          axios
            .get(userUrl)
            .then((res) => {
              setText("Redirecting you");
              const user = res.data.data;
              store.setUser(user);
              store.deleteAuthSessionState();
              router.push(parsedSession.returnTo);
            })
            .catch((err) => {
              const errorResponseCode = err.response.status;
              const errorText = err.response.data.message;
              setText("Oops, looks like an error occurred");
              setErrorText(errorResponseCode + " | " + errorText);
              setLoading(false);
            });
        })
        .catch((err) => {
          const errorText = err.response?.data?.error || "An error occurred";
          setText("Oops, looks like an error occurred");
          setErrorText(errorText);
          setLoading(false);
        });
    }
  }, [store._hasHydrated, router, searchParams]);

  return (
    <div>
      <Head>
        <title>Auth | PESU Discord</title>
      </Head>

      <div className='flex flex-col items-center text-center h-[85vh] my-auto justify-center'>
        {loading && (
          <ReactLoading
            type='bubbles'
            color='#808183'
            height={100}
            width={100}
          />
        )}
        <h1 className='text-4xl text-pesu-c2'>{text}</h1>
        {errorText && (
          <div className='text-2xl m-4'>
            <span className='text-red-500'>{errorText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
