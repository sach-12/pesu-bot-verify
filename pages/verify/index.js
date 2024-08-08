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
			router.push("/login?returnTo=/verify");
		}

		setLoading(false);
	}, [router.isReady]);

	const VerifyInputContainer = () => {
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
			if (!buttonEnabled) return;
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
			<div className='flex flex-col items-center justify-center'>
				<div className='text-justify text-c2 text-xl w-full md:w-2/3 pb-4'>
					Your PESU Academy username and password are required to verify and link your student and discord accounts.
					Don't worry, we don't store any information. You can check out the source code{" "}
					<a
						href='https://github.com/HackerSpace-PESU/pesu-auth/'
						target='_blank'
						className='inline-flex justify-center gap-1 leading-4 hover:underline'>
						<span>
							here
						</span>
						<svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" class="opacity-70"><path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor"></path></svg>
					</a>
					.
				</div>
				<form className="w-2/3 lg:w-1/2 xl:w-1/3 flex flex-col gap-2">
					<label htmlFor='username' className='flex text-c2 text-sm font-medium'>
						PESU Academy Login
					</label>
					<input
						type='text'
						id='username'
						className='p-2 rounded-md text-white bg-c0 border border-white/15 placeholder-c2/50 text-sm focus:outline-none'
						placeholder='Username'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						onKeyUp={(e) => e.key === "Enter" && handleSubmit(e)}
					/>
					<label htmlFor='password' className='flex text-c2 text-sm font-medium'>
						PESU Academy Password
					</label>
					<input
						type='password'
						id='password'
						className='p-2 rounded-md text-white bg-c0 border border-white/15 placeholder-c2/50 text-sm focus:outline-none'
						placeholder='Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyUp={(e) => e.key === "Enter" && handleSubmit(e)}
					/>
					<button
						disabled={!buttonEnabled}
						className={`h-9 px-4 py-2 my-1 w-full flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors
							focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border
							bg-c1 text-white border-c2 cursor-pointer
							hover:bg-white hover:text-c0
							disabled:bg-c1 disabled:text-c2 disabled:cursor-not-allowed`}
						onClick={(e) => handleSubmit(e)}>
						Verify
					</button>
				</form>
				{loading && (
					<div className='flex justify-center mt-2'>
						<ReactLoading type='spin' color='#808183' height={20} width={20} />
					</div>
				)}
				{success && (
					<div className='flex justify-center mt-2 text-md text-white text-center'>
						Succesfully verified! Redirecting to dashboard...
					</div>
				)}
				{error && <div className='text-red-500/90 text-sm text-center'>{error}</div>}
				<div>
					<p className='text-c2 text-md text-center'>
						Need help?{" "}
						<a
							href='https://discord.com/channels/742797665301168220/742956204753551440'
							target='_blank'
							className='inline-flex justify-center gap-1 leading-4 hover:underline'>
							<span>
								Drop a message here
							</span>
							<svg aria-hidden="true" height="7" viewBox="0 0 6 6" width="7" class="opacity-70"><path d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z" fill="currentColor"></path></svg>
						</a>
						.
					</p>
				</div>
				<div className='text-c2 text-center text-xs w-1/2 pt-2'>
					Note: This website is not affiliated with PES University or PESU Academy in any way. This is an independent and unofficial project by the PESU Discord community.
				</div>
			</div>
		);
	};

	return (
		<div>
			<Head>
				<title>Verify with PESU Academy</title>
			</Head>

			<div className='flex flex-col justify-center items-center mt-8 sm:mt-28 lg:mt-40'>
				{loading ? (
					<div>
						<ReactLoading type='bubbles' color='#808183' height={100} width={100} />
						<h1 className='text-4xl text-c2'>Loading</h1>
					</div>
				) : (
					<div className="mx-4 sm:mx-20 md:mx-28 lg:mx-40 xl:mx-52 flex flex-col items-center justify-center text-center border bg-c0 gap-4 rounded-lg border-white/15 p-8">
						{!store.user?.guild_info.in_guild ? (
							<>
								<h1 className='text-3xl text-white font-semibold px-4'>
									Oh no! You are not in the PESU Discord server.
								</h1>
								<button
									className='whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2'
									onClick={() => router.push("https://discord.gg/eZ3uFs2")}>
									Join the Server
								</button>
							</>
						) : store.user?.guild_info.is_verified ? (
							<>
								<h1 className='text-3xl text-white font-semibold px-4'>
									Looks like you're already verified.
								</h1>
								<div className='flex flex-row p-4 justify-center space-x-4'>
									<button
										className='whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2'
										onClick={() =>
											router.push(
												"https://discord.com/channels/742797665301168220/860224115633160203"
											)
										}>
										Open Discord
									</button>
									<button
										className='whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2'
										onClick={() => router.push("/")}>
										Home
									</button>
								</div>
							</>
						) : (
							<>
								<h1 className='text-3xl text-white font-semibold p-4'>
									You are not verified in the PESU Discord server.
								</h1>
								<VerifyInputContainer />
							</>
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
