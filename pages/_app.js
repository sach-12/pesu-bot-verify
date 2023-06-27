import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Head from "next/head";

const MyApp = ({ Component, pageProps }) => {
	return (
		<>
			<Head>
				<link
					href='https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap'
					rel='stylesheet'
				/>
			</Head>
			<Navbar />
			<Component {...pageProps} />
		</>
	);
}

export default MyApp;
