import Head from "next/head";
import { useEffect, useState } from "react";
import { useStore } from "@/utils/store";
import { useRouter } from "next/router";
import { withSessionSsr } from "@/utils/withSession";
import ReactLoading from "react-loading";
import axios from "axios";

const Verify = ({ user, token }) => {
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
		const [prn, setPrn] = useState("");
		const [srn, setSrn] = useState("");
		const [section, setSection] = useState("");

		const [prnState, setPrnState] = useState(0); // 0: initial, 1: loading, 2: success, -1: error
		const [prnError, setPrnError] = useState(null);
		const [secondFieldCollector, setSecondFieldCollector] = useState(null);
		const [secondFieldState, setSecondFieldState] = useState(0); // 0: initial, 1: loading, 2: success, -1: error
		const [secondFieldError, setSecondFieldError] = useState(null);

		const handlePrnChange = (prn) => {
			setPrn(prn.toUpperCase());
			setSecondFieldCollector(null);
			setSecondFieldState(0);
			setSecondFieldError(null);
			if (prn.length === 0) {
				setPrnState(0);
				setPrnError(null);
			} else if (
				(prn.length > 0 && prn.length < 13) ||
				prn.length > 13 ||
				!prn.startsWith("PES")
			) {
				setPrnState(-1);
				setPrnError("Enter a valid PRN.");
			} else {
				setPrnState(1);
				setPrnError(null);
				const url = `/api/info?prn=${prn}`;
				const headers = {
					"Content-Type": "application/json",
					Authorization: `Bearer ${store.token.access_token}`,
				};
				axios
					.get(url, { headers })
					.then((res) => {
						setPrnState(2);
						setPrnError(null);
						setSecondFieldCollector(res.data.requires);
					})
					.catch((err) => {
						setPrnState(-1);
						setPrnError(err.response.data.message);
					});
			}
		};

		const handleSrnChange = (srn) => {
			setSrn(srn.toUpperCase());
			if (srn.length === 0) {
				setSecondFieldState(0);
				setSecondFieldError(null);
			} else if (
				(srn.length > 0 && srn.length < 13) ||
				srn.length > 13 ||
				!srn.startsWith("PES")
			) {
				setSecondFieldState(-1);
				setSecondFieldError("Enter a valid SRN.");
			} else {
				setSecondFieldState(2);
				setSecondFieldError(null);
			}
		};

		const handleSectionChange = (section) => {
			setSection(section.toUpperCase());
			if (section.length === 0) {
				setSecondFieldState(0);
				setSecondFieldError(null);
			} else if (section.length > 1) {
				setSecondFieldState(-1);
				setSecondFieldError("Enter a valid section.");
			} else {
				setSecondFieldState(2);
				setSecondFieldError(null);
			}
		};

		const handleSubmit = () => {
			if (prnState !== 2) return;
			if (secondFieldState !== 2) return;
			setSecondFieldState(1);
			const url = `/api/verify`;
			const headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${store.token.access_token}`,
			};
			let data = {
				PRN: prn,
			};
			if (secondFieldCollector === "srn") {
				data["SRN"] = srn;
			} else if (secondFieldCollector === "section") {
				data["Section"] = `Section ${section}`;
			}
			const payload = {
				data: data,
			};
			axios
				.post(url, payload, { headers })
				.then((res) => {
					setSecondFieldState(3);
					setTimeout(() => {
						router.push("/");
					}, 3000);
				})
				.catch((err) => {
					setSecondFieldState(-1);
					setSecondFieldError(err.response.data.message);
				});
		};

		return (
			<div className='mb-6 w-4/5 sm:w-3/5 md:w-2/5 mx-auto h-40'>
				<label
					htmlFor='prn'
					className={`block mb-2 w-full text-sm font-medium ${
						(prnState === 2 && "text-green-500") ||
						(prnState === -1 && "text-red-500") ||
						"text-c4"
					}`}>
					PRN
				</label>
				<input
					type='text'
					id='prn'
					className={`outline-none focus-within:bg-neutral-50 border border-${
						prnState === 2 ? "green-500" : prnState === -1 ? "red-500" : "c2"
					} placeholder-gray-500 text-sm rounded-sm focus:bg-opacity-90 transition-colors w-full px-3 py-2`}
					placeholder='PES120190XXXX'
					value={prn}
					onChange={(e) => handlePrnChange(e.target.value)}
				/>
				{prnError && <p className='text-red-500 text-sm mt-1'>{prnError}</p>}
				{prnState === 1 && (
					<div className='flex justify-center mt-2'>
						<ReactLoading type='spin' color='#6B7280' height={20} width={20} />
					</div>
				)}
				{secondFieldCollector &&
					(secondFieldCollector === "srn" ? (
						<div>
							<label
								htmlFor='srn'
								className={`block mt-4 mb-2 w-full text-sm font-medium ${
									(secondFieldState === 2 && "text-green-500") ||
									(secondFieldState === -1 && "text-red-500") ||
									"text-c4"
								}`}>
								SRN
							</label>
							<input
								type='text'
								id='srn'
								className={`outline-none focus-within:bg-neutral-50 border border-${
									secondFieldState === 2
										? "green-500"
										: secondFieldState === -1
										? "red-500"
										: "c2"
								} placeholder-gray-500 text-sm rounded-sm focus:bg-opacity-90 transition-colors w-full px-3 py-2`}
								placeholder='PES1UG19XXXXX'
								value={srn}
								onChange={(e) => handleSrnChange(e.target.value)}
							/>
							{secondFieldError && (
								<p className='text-red-500 text-sm mt-1'>{secondFieldError}</p>
							)}
						</div>
					) : (
						<div>
							<label
								htmlFor='section'
								className={`block mt-4 mb-2 w-full text-sm font-medium ${
									(secondFieldState === 2 && "text-green-500") ||
									(secondFieldState === -1 && "text-red-500") ||
									"text-c4"
								}`}>
								Section
							</label>
							<input
								type='text'
								id='section'
								className={`outline-none focus-within:bg-neutral-50 border border-${
									secondFieldState === 2
										? "green-500"
										: secondFieldState === -1
										? "red-500"
										: "c2"
								} placeholder-gray-500 text-sm rounded-sm focus:bg-opacity-90 transition-colors w-full px-3 py-2`}
								placeholder='X'
								value={section}
								onChange={(e) => handleSectionChange(e.target.value)}
							/>
							{secondFieldError && (
								<p className='text-red-500 text-sm mt-1'>{secondFieldError}</p>
							)}
						</div>
					))}
				{secondFieldState === 1 && (
					<div className='flex justify-center mt-2'>
						<ReactLoading type='spin' color='#6B7280' height={20} width={20} />
					</div>
				)}
				{secondFieldCollector && (
					<div className='flex justify-end mt-4'>
						<button
							disabled={secondFieldState !== 2}
							className={`${
								secondFieldState === 2
									? `bg-c4 text-c0 hover:bg-c0 hover:text-c4`
									: `bg-gray-700 text-white cursor-not-allowed`
							} w-full px-8 py-3 rounded-sm text-sm font-medium  transition-colors duration-200 shadow-md`}
							onClick={() => handleSubmit()}>
							Verify
						</button>
					</div>
				)}
				{secondFieldState === 3 && (
					<div className='flex justify-center mt-2 text-c4 text-2xl'>
						Succesfully verified! Redirecting to dashboard...
					</div>
				)}
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
						onClick={() => router.push("/verify/pesuac")}>
						Or login with PESU Academy
					</button>
				</div>
			</div>
		);
	};

	return (
		<div>
			<Head>
				<title>Verify - PESU Discord</title>
			</Head>
			<div className='flex flex-col items-center h-[80vh] my-auto justify-center'>
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

export default Verify;
