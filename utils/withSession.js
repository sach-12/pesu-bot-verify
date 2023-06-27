import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

const sessionOptions = {
	password: process.env.IRON_SESSION_PASSWORD,
	cookieName: "pd_dashboard_session",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
	},
	ttl: 60 * 60 * 24 * 7, // 7 days
};

export const withSessionRoute = (handler) => {
	return withIronSessionApiRoute(handler, sessionOptions);
}

export const withSessionSsr = (handler) => {
	return withIronSessionSsr(handler, sessionOptions);
}
