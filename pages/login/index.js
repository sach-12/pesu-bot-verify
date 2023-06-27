import Head from "next/head";
import { useEffect } from "react";
import { useStore, usePersistentStore } from "@/utils/store";
import { withSessionSsr } from "@/utils/withSession";
import { useRouter } from "next/router";
import axios from "axios";
import ReactLoading from "react-loading";

const Login = ({ user, token }) => {
	const store = useStore();
	const persistentStore = usePersistentStore();
	const router = useRouter();

	useEffect(() => {
		if (!router.isReady) return;

		if (user) {
			store.setUser(user);
			store.setToken(token);
			router.push("/");
			return;
		}

		const { returnTo } = router.query;

		const arr = new Uint8Array(20 / 2);
		window.crypto.getRandomValues(arr);
		const sessionId = Array.from(arr, (dec) => ("0" + dec.toString(16)).padStart(2, "0")).join(
			""
		);
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
	}, [router.isReady]);

	return (
		<div>
			<Head>
				<title>Login - PESU Discord</title>
			</Head>

			<div className='flex flex-col items-center h-[85vh] my-auto justify-center'>
				<ReactLoading type='bubbles' color='#BBE1FA' height={100} width={100} />
				<h1 className='text-4xl text-c4'>Redirecting...</h1>
			</div>
		</div>
	);
};

export const getServerSideProps = withSessionSsr(async ({ req, res }) => {
	const token = req.session.token;
	if (token) {
		const headers = {
			Authorization: `Bearer ${token.access_token}`,
		};
		const url =
			process.env.NODE_ENV === "production"
				? "https://pesudiscord.vercel.app/api/user"
				: "http://localhost:3000/api/user";
		const res = await axios.get(url, { headers });
		if (res) {
			return {
				props: {
					user: res.data.data,
					token,
				},
			};
		}
	}
	return {
		props: {},
	};
});

export default Login;
