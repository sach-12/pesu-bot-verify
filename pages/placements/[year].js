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

    const data = {
		"2023": "https://docs.google.com/spreadsheets/d/1a-eaEBcTeOJESck3f8W_I3uJqRRiEc_7d5O1Xc3nIUg/edit#gid=1137367370",
        "2024": "https://docs.google.com/spreadsheets/d/1YZ7HtUcvA9jqWZ04DuwTT66aTV7gU7DUlXyO2BewpII/edit#gid=1441576938"
    }

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady) return;

		if (user) {
			store.setUser(user);
			store.setToken(token);
		}

        if (data[router.query.year]) {
            window.location.replace(data[router.query.year]);
        } else {
			setLoading(false);
		}
	}, [router.isReady]);

    return (
        <div>
            <Head>
                <title>Placements | PESU Discord</title>
            </Head>
            
            {loading ? (
                <div className='flex flex-col items-center h-[85vh] my-auto justify-center'>
                    <ReactLoading type='bubbles' color='#808183' height={100} width={100} />
                    <h1 className='text-4xl text-c2'>Loading</h1>
                </div>
            ) : (
                <div className='flex flex-col items-center h-[85vh] my-auto justify-center'>
                    <h1 className='text-4xl text-white'>Data not available for {router.query.year}</h1>
                </div>
            )}
        </div>
    )
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