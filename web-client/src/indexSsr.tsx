import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProTip from "./ProTip";
import Link from "./Link";
import Copyright from "./Copyright";
import cookie from "cookie";
import { MeDocument } from "./generated/graphql";
import MenuAppBar from "./Appbar";
import { useRouter } from "next/router";
import { addApolloState, initializeApollo } from "./tools/apolloClient";
import { GetServerSideProps } from "next";
import { setAccessToken } from "./tools/accessToken";
import ClientOnly from "./ClientOnly";

export default function Index(props: any) {
	if (props.me) {
		console.log("user exists: ", props.me);
	}
	//const { data, loading } = useMeQuery();

	const user = props.me.user;
	const router = useRouter();

	if (!user && !user.id) router.push("/signin");

	return (
		<>
			<ClientOnly>
				<MenuAppBar />
			</ClientOnly>
			<Container maxWidth="sm">
				<Box sx={{ my: 4 }}>
					<Typography variant="h4">welcome {user.username}</Typography>
					<Typography
						sx={{ textTransform: "capitalize" }}
						variant="h4"
						component="h1"
						gutterBottom
					>
						Micro-Services authentication system example
					</Typography>
					<Link href="/about" color="secondary">
						Go to the about page
					</Link>
					<ProTip />
					<Copyright />
				</Box>
			</Container>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const apolloClient = initializeApollo(null);
	if (req.headers.cookie) {
		const cookies = cookie.parse(req.headers.cookie);
		if (cookies.jid) {
			const response = await fetch("http://localhost:4000/refresh_token", {
				method: "POST",
				credentials: "include",
				headers: {
					cookie: "jid=" + cookies.jid,
				},
			});
			const json = await response.json();
			const token = json.accessToken as string;
			console.log("token is: ", token);
			setAccessToken(token);
			const result = await apolloClient.query({
				query: MeDocument,
			});
			return addApolloState(apolloClient, {
				props: { me: result.data.me },
			});
		}
	}

	return addApolloState(apolloClient, {
		props: {},
	});
};
