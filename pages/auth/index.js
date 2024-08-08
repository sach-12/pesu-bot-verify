import Head from "next/head";
import { useEffect, useState } from "react";
import { useStore, usePersistentStore } from "@/utils/store";
import { withSessionSsr } from "@/utils/withSession";
import { useRouter } from "next/router";
import axios from "axios";
import ReactLoading from "react-loading";

const Auth = ({ user, token }) => {
	const store = useStore();
	const persistentStore = usePersistentStore();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [text, setText] = useState("Loading");
	const [errorText, setErrorText] = useState(null);

	useEffect(() => {
		if (!router.isReady) return;

		if (user) {
			store.setUser(user);
			store.setToken(token);
			router.push("/");
			return;
		}

		const { code, state, error } = router.query;
		if (error) {
			setText("Oops, looks like a Discord authentication error");
			setErrorText(decodeURIComponent(router.query.error_description));
			setLoading(false);
			return;
		}
		if (!code || !state) {
			setText("Invalid request");
			setErrorText("Missing code or state parameter");
			setLoading(false);
			return;
		}
		const session = persistentStore.session;
		if (!session) {
			setText("Invalid request");
			setErrorText("Invalid session");
			setLoading(false);
			return;
		}
		const decodedSession = Buffer.from(session, "base64").toString("ascii");
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
				.then((res) => {
					setText("Almost there");
					const token = res.data.data;
					store.setToken(token);
					const userUrl = "/api/user";
					const headers = {
						Authorization: `Bearer ${token.access_token}`,
					};
					axios
						.get(userUrl, { headers })
						.then((res) => {
							setText("Redirecting you");
							const user = res.data.data;
							store.setUser(user);
							persistentStore.setSession(null);
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
					const errorResponseCode = err.response.status;
					const errorText = err.response.data.message;
					setText("Oops, looks like an error occurred");
					setErrorText(errorResponseCode + " | " + errorText);
					setLoading(false);
				});
		}
	}, [router.isReady]);

	return (
		<div>
			<Head>
				<title>Auth - PESU Discord</title>
			</Head>

			<div className='flex flex-col items-center text-center h-[85vh] my-auto justify-center'>
				{loading && (
					<ReactLoading type='bubbles' color='#808183' height={100} width={100} />
				)}
				<h1 className='text-4xl text-c2'>{text}</h1>
				{errorText && (
					<div className='text-2xl m-4'>
						<span className='text-red-500'>{errorText}</span>
					</div>
				)}
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

export default Auth;
