import Head from "next/head";
import { useEffect } from "react";
import { useSessionStore, useLocalStore } from "@/utils/store/provider";
import { useRouter } from "next/navigation";
import axios from "axios";
import ReactLoading from "react-loading";

const Login = ({ user, token }) => {
  const store = useSessionStore();
  const persistentStore = useLocalStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      store.setUser(user);
      store.setToken(token);
      router.push("/");
      return;
    }

    const { returnTo } = router.query;

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
    persistentStore.setSession(base64Session);

    const redirectUri = encodeURIComponent(
      process.env.NODE_ENV === "production"
        ? "https://pesudiscord.vercel.app/auth"
        : "http://localhost:3000/auth"
    );

    const url = `https://discord.com/api/oauth2/authorize?client_id=980529206276526100&redirect_uri=${redirectUri}&response_type=code&scope=identify&state=${sessionId}`;
    window.location.href = url;
  }, []);

  return (
    <div>
      <Head>
        <title>Login - PESU Discord</title>
      </Head>

      <div className='flex flex-col items-center h-[85vh] my-auto justify-center'>
        <ReactLoading type='bubbles' color='#808183' height={100} width={100} />
        <h1 className='text-4xl text-c2'>Redirecting</h1>
      </div>
    </div>
  );
};

export default Login;
