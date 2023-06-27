import Head from "next/head";
import { useEffect, useState } from "react";
import { useStore } from "@/utils/store";
import { useRouter } from "next/router";
import { withSessionSsr } from "@/utils/withSession";
import ReactLoading from "react-loading";
import axios from "axios";

const VerifyWithPesuAc = ({ user, token }) => {
	const store = useStore();
	const router = useRouter();

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady) return;

		if (user) {
			store.setUser(user);
			store.setToken(token);
		} else {
			router.push("/login?returnTo=/verify/pesuac");
		}

		setLoading(false);
	}, [router.isReady]);

	const VerifyInputContainer = () => {
		const [username, setUsername] = useState("");
		const [password, setPassword] = useState("");
		const [loading, setLoading] = useState(false);
		const [success, setSuccess] = useState(false);
		const [error, setError] = useState(null);
		const [buttoneEnabled, setButtonEnabled] = useState(false);

		useEffect(() => {
			if (username === "" || password === "") {
				setButtonEnabled(false);
			} else {
				setButtonEnabled(true);
			}
		}, [username, password]);

		const handleSubmit = async () => {
			setLoading(true);
			setError(null);
			const url = "/api/verify/pesuac";
			const data = {
				username,
				password,
			};
			const headers = {
				Authorization: `Bearer ${store.token.access_token}`,
				"Content-Type": "application/json",
			};
			try {
				await axios.post(url, JSON.stringify(data), { headers });
				setSuccess(true);
				setError(null);
				setTimeout(() => {
					router.push("/");
				}, 3000);
			} catch (err) {
				setError(err.response.data.message);
			}
			setLoading(false);
		};

		return (
			<div className='mb-6 w-4/5 sm:w-3/5 md:w-2/5 mx-auto h-40'>
				<div className='text-justify text-c2 text-xl mb-4'>
					Your PESU Academy username and password are required to verify your account.
					Don't worry, we don't store any information. You can check out the source code{" "}
					<a
						href='https://github.com/HackerSpace-PESU/pesu-auth/'
						target='_blank'
						className='text-c3 underline'>
						here
					</a>
					.
				</div>
				<label htmlFor='username' className='block my-2 w-full text-sm font-medium text-c4'>
					PESU Academy Username
				</label>
				<input
					type='text'
					id='username'
					className='outline-none focus-within:bg-neutral-50 border border-c2 placeholder-gray-500 text-sm rounded-sm focus:bg-opacity-90 transition-colors w-full px-3 py-2'
					placeholder='Username'
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label htmlFor='password' className='block my-2 w-full text-sm font-medium text-c4'>
					PESU Academy Password
				</label>
				<input
					type='password'
					id='password'
					className='outline-none focus-within:bg-neutral-50 border border-c2 placeholder-gray-500 text-sm rounded-sm focus:bg-opacity-90 transition-colors w-full px-3 py-2'
					placeholder='Password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button
					disabled={!buttoneEnabled}
					className={`w-full px-8 py-3 rounded-sm text-sm font-medium ${
						buttoneEnabled
							? "hover:bg-c0 hover:text-c4 bg-c4 text-c0"
							: "cursor-not-allowed bg-gray-700 text-white"
					} transition-colors duration-200 shadow-md my-4`}
					onClick={() => handleSubmit()}>
					Verify
				</button>
				{loading && (
					<div className='flex justify-center mt-2'>
						<ReactLoading type='spin' color='#6B7280' height={20} width={20} />
					</div>
				)}
				{success && (
					<div className='flex justify-center mt-2 text-c4 text-2xl text-center'>
						Succesfully verified! Redirecting to dashboard...
					</div>
				)}
				{error && <div className='text-red-500 text-sm text-center'>{error}</div>}
				<div>
					<p className='text-lg text-c4 text-center mt-4'>
						Need help?{" "}
						<a
							href='https://discord.com/channels/742797665301168220/742956204753551440'
							target='_blank'
							className='text-c3 underline'>
							Drop a message here
						</a>
						.
					</p>
				</div>
				<div className='flex justify-center mt-4'>
					<button
						className='bg-c4 w-full text-c0 px-8 py-3 rounded-sm text-sm font-medium hover:bg-c0 hover:text-c4 transition-colors duration-200 shadow-md'
						onClick={() => router.push("/verify")}>
						Or use your PRN
					</button>
				</div>
				<div className='text-center text-sm text-c3 py-4'>
					Note: This website is not affiliated with PES University or PESU Academy in any
					way.
				</div>
			</div>
		);
	};

	return (
		<div>
			<Head>
				<title>Verify with PESU Academy</title>
			</Head>

			<div className='flex flex-col items-center h-[40vh] my-auto justify-center'>
				{loading ? (
					<div>
						<ReactLoading type='bubbles' color='#BBE1FA' height={100} width={100} />
						<h1 className='text-4xl text-c4'>Loading...</h1>
					</div>
				) : (
					<div>
						{!store.user.guild_info.in_guild ? (
							<div className='flex flex-col items-center text-center'>
								<h1 className='text-4xl text-c4 p-4'>
									Oh no! You are not in the PESU Discord server.
								</h1>
								<button
									className='bg-c4 text-c1 px-6 py-2 rounded-sm text-md hover:bg-c1 hover:text-c4 transition-all duration-200 ease-in-out'
									onClick={() => router.push("https://discord.gg/eZ3uFs2")}>
									Join
								</button>
							</div>
						) : store.user.guild_info.is_verified ? (
							<div>
								<h1 className='text-4xl text-c4 p-4 text-center'>
									Looks like you're already verified.
								</h1>
								<div className='flex flex-row p-4 justify-center'>
									<button
										className='bg-c4 text-c1 px-6 py-2 mx-4 rounded-sm text-md hover:bg-c1 hover:text-c4 transition-all duration-200 ease-in-out'
										onClick={() =>
											router.push(
												"https://discord.com/channels/742797665301168220/860224115633160203"
											)
										}>
										Open Discord
									</button>
									<button
										className='bg-c4 text-c1 px-6 py-2 mx-4 rounded-sm text-md hover:bg-c1 hover:text-c4 transition-all duration-200 ease-in-out'
										onClick={() => router.push("/")}>
										Home
									</button>
								</div>
							</div>
						) : (
							<div>
								<h1 className='text-4xl text-c4 p-4 text-center'>
									You are not verified in the PESU Discord server.
								</h1>
								<VerifyInputContainer />
							</div>
						)}
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

export default VerifyWithPesuAc;
