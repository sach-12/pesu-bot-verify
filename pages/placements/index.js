import Head from "next/head";
import { useEffect, useState } from "react";
import { useStore } from "@/utils/store";
import { useRouter } from "next/router";
import { withSessionSsr } from "@/utils/withSession";
import ReactLoading from "react-loading";
import axios from "axios";

const Placement = ({ user, token }) => {
	const store = useStore();
	const router = useRouter();

	const availableYears = ["2023", "2024"];

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady) return;

		if (user) {
			store.setUser(user);
			store.setToken(token);
		}

		setLoading(false);
	}, [router.isReady]);

	return (
		<div>
			<Head>
				<title>Placements | PESU Discord</title>
			</Head>

			{loading ? (
				<div className='flex flex-col items-center h-[85vh] my-auto justify-center'>
					<ReactLoading type='bubbles' color='#BBE1FA' height={100} width={100} />
					<h1 className='text-4xl text-c4 ml-10'>Sit tight...</h1>
				</div>
			) : (
				<div className='flex flex-col items-center h-[85vh] my-auto justify-center'>
					<h1 className='text-4xl text-c4'>Placements Data</h1>
					<div className='flex flex-row'>
						{availableYears.map((year) => (
							<button
								key={year.toString()}
								onClick={() => router.push(`/placements/${year}`)}
								className='bg-c0 text-c4 rounded-sm px-4 py-2 m-2'>
								{year}
							</button>
						))}
					</div>
				</div>
			)}
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

export default Placement;
