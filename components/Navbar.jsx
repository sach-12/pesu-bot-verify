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
	const outerRef = useRef();

	useEffect(() => {
		if (store.user === undefined) return;
		setLoading(false);
	}, [store]);

	const handleClickOutsideOuterRef = (e) => {
		if (outerRef.current && !outerRef.current.contains(e.target)) {
			setOpen(false);
		}
	};
	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutsideOuterRef);
		return () => document.removeEventListener("mousedown", handleClickOutsideOuterRef);
	}, []);

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

	const SideNav = ({ref}) => {
		return (
			<div className='flex flex-col justify-start px-5 bg-c0 h-full space-y-4' ref={ref}>
				<button
					onClick={() => setOpen(false)}
					className='flex flex-row items-center'>
					<img
						src={menu.src}
						alt='MENU'
						className='py-6 px-3 stroke-current text-c1'
						width={60}
						height={60}
					/>
					<span className='text-3xl sm:text-4xl text-white/85 font-bold w-full'>MENU</span>
				</button>

				<button
					onClick={() => {
						router.push("/");
						setOpen(false);
					}}
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xl text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-12">
					Home
				</button>
				<button
					onClick={() => {
						router.push("/placements");
						setOpen(false);
					}}
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xl text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-12">
					Placements Data
				</button>
				{!store.user ? (
					<button
						onClick={() => {
							router.push("/login?returnTo=/");
							setOpen(false);
						}}
						className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xl text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-12">
						Login
					</button>
				) : (
					<>
						{!store.user?.guild_info.in_guild && (
							<button
								onClick={() => {
									router.push("https://discord.gg/eZ3uFs2");
									setOpen(false);
								}}
								className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xl text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-12">
								Join PESU Discord
							</button>
						)}

						{store.user?.guild_info.is_verified && (
							<button
								onClick={() => {
									router.push("/event")
									setOpen(false)
								}}
								className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xl text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-12">
								Post an Event
							</button>
						)}
						{!store.user?.guild_info.is_verified && (
							<button
								onClick={() => {
									router.push("/verify");
									setOpen(false);
								}}
								className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xl text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-12">
								Verify
							</button>
						)}
						<button
							onClick={() => {
								logout();
								setOpen(false);
							}}
							className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xl text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-12">
							Logout
						</button>
					</>
				)}
			</div>
		);
	};

	const TopNav = () => {
		const [open, setOpen] = useState(false);
		const [arrClasses, setArrClasses] = useState("w-4 h-4 ml-0.5");
		const ref = useRef();

		const handleClickOutside = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
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
			<div className='inline-flex h-10 my-auto rounded-sm'>
				<div className='relative' ref={ref}>
					{store.user ? (
						<button
							type='button'
							onClick={() => setOpen(!open)}
							className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c0 shadow-sm hover:bg-white hover:text-c0 h-10 px-4 py-2'>
							<img
								src={`https://cdn.discordapp.com/avatars/${store.user?.id}/${store.user?.avatar}`}
								alt='Avatar'
								className='w-8 h-8 mr-2 rounded-full'
							/>
							{store.user?.username}
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
						<div className="flex items-center justify-end space-x-2">
							<button
								type='button'
								onClick={() => router.push("/login?returnTo=/")}
								className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c0 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2'>
								Login
							</button>
							<button
								type='button'
								onClick={() => router.push("/placements")}
								className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c0 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2'>
								Placements Data
							</button>
						</div>
					)}

					{open && (
						<div className='absolute right-0 z-10 w-48 mt-4 origin-top-right bg-c0 shadow-lg rounded-md'>
							<div className='p-4 flex flex-col space-y-2'>
								{!store.user?.guild_info.in_guild && (
									<div>
										<button
											onClick={() => {
												router.push("https://discord.gg/eZ3uFs2");
											}}
											className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2">
											Join PESU Discord
										</button>
									</div>
								)}
								{store.user?.guild_info.is_verified && (
									<div>
										<button
											onClick={() => {
												router.push("/event");
											}}
											className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2">
											Post an Event
										</button>
									</div>
								)}
								{!store.user?.guild_info.is_verified && (
									<div>
										<button
											onClick={() => {
												router.push("/verify");
											}}
											className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2">
											Verify
										</button>
									</div>
								)}
								<button
									onClick={() => router.push("/placements")}
									className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2">
									Placements Data
								</button>
								<button
									onClick={() => logout()}
									className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white border border-c2 bg-c1 shadow-sm hover:bg-white hover:text-c0 h-9 px-4 py-2">
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
		<nav className='w-full bg-gradient-to-b from-c0/10 via-c0/50 to-c0/80 bg-c1 border-b border-white/5 justify-between px-5 sm:px-10 md:px-20'>
			{/* Mobile view */}
			<div className='flex flex-row justify-between items-center md:hidden'>
				<div
					className={`fixed top-0 left-0 w-4/5 h-full z-10 ${
						open ? "translate-x-0" : "-translate-x-full"
					} ease-in-out duration-200`} ref={outerRef}>
					<SideNav />
				</div>
				<button
					onClick={() => setOpen(!open)}
					className='inline-flex items-center text-sm rounded-lg focus:outline-none'>
					<img
						src={menu.src}
						alt='MENU'
						className='py-6 px-3 stroke-current text-white'
						width={60}
						height={60}
					/>
				</button>

				<button
					onClick={() => router.push("/")}
					className='flex items-center py-6 px-3 text-white text-2xl sm:text-3xl font-extrabold m-auto'>
					<span>PESU Discord</span>
				</button>
				{store.user && (
					<button
						onClick={() => setOpen(!open)}
						className='inline-flex items-center text-sm rounded-lg focus:outline-none'>
						<img
							src={`https://cdn.discordapp.com/avatars/${store.user?.id}/${store.user?.avatar}`}
							alt='Avatar'
							className='w-8 h-8 mr-2 rounded-full'
						/>
					</button>
				)}
			</div>

			{/* Desktop view */}
			<div className='hidden md:flex flex-row justify-between'>
				<button
					onClick={() => router.push("/")}
					className='flex items-center py-4 px-1 text-white text-3xl font-extrabold tracking-wide'>
					<span>PESU Discord</span>
				</button>
				{!loading && <TopNav />}
			</div>
		</nav>
	);
};

export default Navbar;
