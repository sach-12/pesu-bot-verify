import Head from "next/head";
import { useEffect, useState } from "react";
import { useStore } from "@/utils/store";
import { withSessionSsr } from "@/utils/withSession";
import { useRouter } from "next/router";
import axios from "axios";

const Event = ({ user, token }) => {
	const store = useStore();
	const router = useRouter();

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady) return;

		if (user) {
			store.setUser(user);
			store.setToken(token);
		} else {
			router.push("/login?redturnTo=/event");
		}
		setLoading(false);
	}, [router.isReady]);
	return (
		<div>
			<Head>
				<title>Post an Event - PESU Discord</title>
			</Head>

			<div className='flex flex-col items-center text-center h-[85vh] my-auto justify-center'>
				<h1 className='text-4xl text-c2'>Coming soon</h1>
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

export default Event;
