"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { usePersistentStore } from "@/utils/store/provider";
import { useRouter } from "next/navigation";
import ReactLoading from "react-loading";
import axios from "axios";

const Link = () => {
  const store = usePersistentStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store._hasHydrated || router === undefined) return;

    if (!store.user) {
      router.push("/login?returnTo=/link");
      return;
    }

    setLoading(false);
  }, [store._hasHydrated, router]);

  const LinkInputContainer = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);

    useEffect(() => {
      if (username === "" || password === "") {
        setButtonEnabled(false);
      } else {
        setButtonEnabled(true);
      }
    }, [username, password]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setLoading(true);
      setError(null);

      try {
        // Step 1: Authenticate with PESU credentials
        const authUrl = "/api/link/authenticate";
        const authHeaders = {
          "Content-Type": "application/json",
          "auth-token": store.user?.access_token,
        };

        const authRes = await axios.get(
          `${authUrl}?username=${username}&password=${password}`,
          { headers: authHeaders }
        );

        if (authRes.data.statusCode !== 200) {
          setError(authRes.data.message + " | " + authRes.data.error);
          setLoading(false);
          return;
        }

        // Step 2: Complete the linking process with the token
        const completeUrl = "/api/link/complete";
        const completeHeaders = {
          "Content-Type": "application/json",
        };

        const completeRes = await axios.get(
          `${completeUrl}?token=${authRes.data.data.token}`,
          { headers: completeHeaders }
        );

        if (completeRes.data.statusCode !== 200) {
          setError(completeRes.data.message + " | " + completeRes.data.error);
          setLoading(false);
          return;
        }
        setSuccess(true);
        setError(null);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (error) {
        setError(error.response?.data?.message || "An error occurred");
        setLoading(false);
      }
      setLoading(false);
    };

    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-justify text-pesu-c2 text-xl w-full md:w-2/3 pb-4">
          Your PESU Academy username and password are required for access to the
          Discord server. We use an open-source authentication system to link
          your accounts. You can check out the source code{" "}
          <a
            href="https://github.com/HackerSpace-PESU/pesu-auth/"
            target="_blank"
            className="inline-flex justify-center gap-1 leading-4 hover:underline"
          >
            <span>here</span>
            <svg
              aria-hidden="true"
              height="7"
              viewBox="0 0 6 6"
              width="7"
              className="opacity-70"
            >
              <path
                d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z"
                fill="currentColor"
              ></path>
            </svg>
          </a>
          .
        </div>
        <form className="w-2/3 lg:w-1/2 xl:w-1/3 flex flex-col gap-2">
          <label
            htmlFor="username"
            className="flex text-pesu-c2 text-sm font-medium"
          >
            PESU Academy Login
          </label>
          <input
            type="text"
            id="username"
            className="p-2 rounded-md text-white bg-pesu-c0 border border-white/15 placeholder-pesu-c2/50 text-sm focus:outline-none"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={(e) =>
              e.key === "Enter" && buttonEnabled && handleSubmit(e)
            }
          />
          <label
            htmlFor="password"
            className="flex text-pesu-c2 text-sm font-medium"
          >
            PESU Academy Password
          </label>
          <input
            type="password"
            id="password"
            className="p-2 rounded-md text-white bg-pesu-c0 border border-white/15 placeholder-pesu-c2/50 text-sm focus:outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={(e) =>
              e.key === "Enter" && buttonEnabled && handleSubmit(e)
            }
          />
          <button
            disabled={!buttonEnabled}
            className={`h-9 px-4 py-2 my-1 w-full flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors
							focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border
							bg-pesu-c1 text-white border-pesu-c2 cursor-pointer
							hover:bg-white hover:text-pesu-c0
							disabled:bg-pesu-c1 disabled:text-pesu-c2 disabled:cursor-not-allowed`}
            onClick={(e) => handleSubmit(e)}
          >
            Submit
          </button>
        </form>
        {loading && (
          <div className="flex justify-center mt-2">
            <ReactLoading type="spin" color="#808183" height={20} width={20} />
          </div>
        )}
        {success && (
          <div className="flex justify-center mt-2 text-md text-white text-center">
            Succesfully linked! Redirecting to home...
          </div>
        )}
        {error && (
          <div className="text-red-500/90 text-sm text-center">{error}</div>
        )}
        <div>
          <p className="text-pesu-c2 text-md text-center">
            Need help?{" "}
            <a
              href="https://discord.com/channels/742797665301168220/742956204753551440"
              target="_blank"
              className="inline-flex justify-center gap-1 leading-4 hover:underline"
            >
              <span>Drop a message here</span>
              <svg
                aria-hidden="true"
                height="7"
                viewBox="0 0 6 6"
                width="7"
                className="opacity-70"
              >
                <path
                  d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z"
                  fill="currentColor"
                ></path>
              </svg>
            </a>
            .
          </p>
        </div>
        <div className="text-pesu-c2 text-center text-xs w-1/2 pt-2">
          Disclaimer: This website is not affiliated with PES University or PESU
          Academy in any way. This is an independent and unofficial project by
          the PESU Discord community.
        </div>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Link with PESU Academy</title>
      </Head>

      <div className="flex flex-col justify-center items-center mt-8 sm:mt-28 lg:mt-40">
        {loading ? (
          <div>
            <ReactLoading
              type="bubbles"
              color="#808183"
              height={100}
              width={100}
            />
            <h1 className="text-4xl text-pesu-c2">Loading</h1>
          </div>
        ) : (
          <div className="mx-4 sm:mx-20 md:mx-28 lg:mx-40 xl:mx-52 flex flex-col items-center justify-center text-center border bg-pesu-c0 gap-4 rounded-lg border-white/15 p-8">
            {!store.user?.guild_info.in_guild ? (
              <>
                <h1 className="text-3xl text-white font-semibold px-4">
                  Oh no! You are not in the PESU Discord server.
                </h1>
                <button
                  className="whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-pesu-c2 bg-pesu-c1 shadow-sm hover:bg-white hover:text-pesu-c0 h-9 px-4 py-2"
                  onClick={() => router.push("https://discord.gg/eZ3uFs2")}
                >
                  Join the Server
                </button>
              </>
            ) : store.user?.guild_info.has_linked ? (
              <>
                <h1 className="text-3xl text-white font-semibold px-4">
                  Looks like you've already linked your accounts.
                </h1>
                <div className="flex flex-row p-4 justify-center space-x-4">
                  <button
                    className="whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-pesu-c2 bg-pesu-c1 shadow-sm hover:bg-white hover:text-pesu-c0 h-9 px-4 py-2"
                    onClick={() =>
                      router.push(
                        "https://discord.com/channels/742797665301168220/860224115633160203"
                      )
                    }
                  >
                    Open Discord
                  </button>
                  <button
                    className="whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-pesu-c2 bg-pesu-c1 shadow-sm hover:bg-white hover:text-pesu-c0 h-9 px-4 py-2"
                    onClick={() => router.push("/")}
                  >
                    Home
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl text-white font-semibold p-4">
                  You have not linked your accounts.
                </h1>
                <LinkInputContainer />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Link;