import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useStore } from "@/utils/store";
import menu from "@/assets/menu.svg";
import axios from "axios";

const Navbar = () => {
	const router = useRouter();
	const store = useStore();

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (store.user === undefined) return;
		setLoading(false);
	}, [store]);

	const logout = async () => {
		const url = "/api/logout";
		const headers = {
			Authorization: `Bearer ${store.token.access_token}`,
		};
		try {
			await axios.get(url, { headers });
			router.push("/");
			store.setUser(null);
			store.setToken(null);
		} catch (err) {
			console.log(err);
		}
	};

	const SideNav = () => {
		return (
			<div className='flex flex-col justify-start px-5 bg-c2 h-full'>
				<button
					onClick={() => setOpen(false)}
					className='flex flex-row items-center justify-between'>
					<img
						src={menu.src}
						alt='MENU'
						className='py-6 px-3 stroke-current text-c1'
						width={60}
						height={60}
					/>
					<span className='text-3xl sm:text-4xl text-c0 font-bold w-full'>MENU</span>
				</button>

				<button
					onClick={() => {
						router.push("/");
						setOpen(false);
					}}
					className='inline-block self-center text-2xl sm:text-3xl text-c4 text-opacity-80 tracking-wide no-underline p-6 rounded-sm border-2 border-c1 bg-c1 w-full text-center my-4 hover:text-c1 hover:bg-c3 transition-all duration-300'>
					Home
				</button>
				{!store.user ? (
					<button
						onClick={() => {
							router.push("/login?returnTo=/");
							setOpen(false);
						}}
						className='inline-block self-center text-2xl sm:text-3xl text-c4 text-opacity-80 tracking-wide no-underline p-6 rounded-sm border-2 border-c1 bg-c1 w-full text-center my-4 hover:text-c1 hover:bg-c3 transition-all duration-300'>
						Login
					</button>
				) : (
					<div>
						{!store.user.guild_info.in_guild && (
							<button
								onClick={() => {
									router.push("https://discord.gg/eZ3uFs2");
									setOpen(false);
								}}
								className='inline-block self-center text-2xl sm:text-3xl text-c4 text-opacity-80 tracking-wide no-underline p-6 rounded-sm border-2 border-c1 bg-c1 w-full text-center my-4 hover:text-c1 hover:bg-c3 transition-all duration-300'>
								Join PESU Discord
							</button>
						)}

						{/* {store.user.guild_info.is_verified && (
							<button
								onClick={() => {
									router.push("/event")
									setOpen(false)
								}}
								className='inline-block self-center text-2xl sm:text-3xl text-c4 text-opacity-80 tracking-wide no-underline p-6 rounded-sm border-2 border-c1 bg-c1 w-full text-center my-4 hover:text-c1 hover:bg-c3 transition-all duration-300'>
								Post Event
							</button>
						)} */}
						{!store.user.guild_info.is_verified && (
							<button
								onClick={() => {
									router.push("/verify");
									setOpen(false);
								}}
								className='inline-block self-center text-2xl sm:text-3xl text-c4 text-opacity-80 tracking-wide no-underline p-6 rounded-sm border-2 border-c1 bg-c1 w-full text-center my-4 hover:text-c1 hover:bg-c3 transition-all duration-300'>
								Verify
							</button>
						)}
						<button
							onClick={() => {
								logout();
								setOpen(false);
							}}
							className='inline-block self-center text-2xl sm:text-3xl text-c4 text-opacity-80 tracking-wide no-underline p-6 rounded-sm border-2 border-c1 bg-c1 w-full text-center my-4 hover:text-c1 hover:bg-c3 transition-all duration-300'>
							Logout
						</button>
					</div>
				)}
			</div>
		);
	};

	const TopNav = () => {
		const [open, setOpen] = useState(false);
		const [arrClasses, setArrClasses] = useState("w-4 h-4 ml-0.5");
		const ref = useRef();

		const handleClickOutside = (e) => {
			if (!ref.current.contains(e.target)) {
				setOpen(false);
			}
		};

		useEffect(() => {
			if (open) {
				setArrClasses(
					"w-4 h-4 ml-0.5 rotate-180 transform transition-all duration-75 ease-in-out"
				);
			} else {
				setArrClasses("w-4 h-4 ml-0.5 transform transition-all duration-75 ease-in-out");
			}
		}, [open]);

		useEffect(() => {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		return (
			<div ref={ref} className='inline-flex h-12 bg-c4 my-auto border border-c4 rounded-sm'>
				<div className='relative'>
					{store.user ? (
						<button
							type='button'
							onClick={() => setOpen(!open)}
							className='inline-flex items-center justify-center h-full px-2 text-lg tracking-wide text-c0 hover:text-c4 hover:bg-c0 transition-all duration-200 ease-in-out'>
							<img
								src={`https://cdn.discordapp.com/avatars/${store.user.id}/${store.user.avatar}`}
								alt='Avatar'
								className='w-8 h-8 mr-2 rounded-full'
							/>
							{store.user.username}
							{store.user.discriminator !== "0" && "#" + store.user.discriminator}
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className={arrClasses}
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
								strokeWidth={3}>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M19 9l-7 7-7-7'
								/>
							</svg>
						</button>
					) : (
						<button
							type='button'
							onClick={() => router.push("/login?returnTo=/")}
							className='h-full px-8 text-lg tracking-wide text-c1 hover:text-c4 hover:bg-c0 hover:border-c4 transition-all duration-200 ease-in-out'>
							Login
						</button>
					)}

					{open && (
						<div className='absolute right-0 z-10 w-40 mt-4 origin-top-right bg-c4 shadow-lg'>
							<div className='p-2'>
								{!store.user.guild_info.in_guild && (
									<div>
										<button
											onClick={() => {
												router.push("https://discord.gg/eZ3uFs2");
											}}
											className='block w-full px-4 py-2 text-center text-c0 rounded-sm hover:bg-c3 hover:text-c4 transition-all duration-75 ease-in-out'>
											Join PESU Discord
										</button>
										<hr className='my-2 border-c0' />
									</div>
								)}
								{/* {store.user.guild_info.is_verified && (
									<div>
										<button
											onClick={() => {
												router.push("/event");
											}}
											className='block w-full px-4 py-2 text-center text-c0 rounded-sm hover:bg-c3 hover:text-c4 transition-all duration-75 ease-in-out'>
											Post Event
										</button>
										<hr className='my-2 border-c0' />
									</div>
								)} */}
								{!store.user.guild_info.is_verified && (
									<div>
										<button
											onClick={() => {
												router.push("/verify");
											}}
											className='block w-full px-4 py-2 text-center text-c0 rounded-sm hover:bg-c3 hover:text-c4 transition-all duration-75 ease-in-out'>
											Verify
										</button>
										<hr className='my-2 border-c0' />
									</div>
								)}
								<button
									onClick={() => logout()}
									className='block w-full px-4 py-2 text-center text-c0 rounded-sm hover:bg-c3 hover:text-c4 transition-all duration-75 ease-in-out'>
									Logout
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<nav className='w-full bg-c0 mx-auto justify-between px-5 sm:px-10 md:px-20 shadow-c1 shadow-md'>
			<div className='flex flex-row justify-between items-center md:hidden'>
				<div
					className={`fixed top-0 left-0 w-4/5 h-full bg-c1 z-10 ${
						open ? "translate-x-0" : "-translate-x-full"
					} ease-in-out duration-200`}>
					<SideNav />
				</div>
				<button
					onClick={() => setOpen(!open)}
					className='inline-flex items-center text-sm rounded-lg focus:outline-none focus:ring-2'>
					<img
						src={menu.src}
						alt='MENU'
						className='py-6 px-3 stroke-current text-c4'
						width={60}
						height={60}
					/>
				</button>

				<button
					onClick={() => router.push("/")}
					className='flex items-center py-6 px-3 text-c4 text-2xl sm:text-3xl font-bold m-auto'>
					<span>PESU Discord</span>
				</button>
				{store.user && (
					<img
						src={`https://cdn.discordapp.com/avatars/${store.user.id}/${store.user.avatar}`}
						alt='Avatar'
						className='w-8 h-8 mr-2 rounded-full'
					/>
				)}
			</div>

			<div className='hidden md:flex flex-row justify-between'>
				<button
					onClick={() => router.push("/")}
					className='flex items-center py-5 px-3 text-c4 text-4xl font-bold tracking-wide'>
					<span>PESU Discord</span>
				</button>
				{!loading && <TopNav />}
			</div>
		</nav>
	);
};

export default Navbar;
