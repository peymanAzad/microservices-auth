import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import * as React from "react";
import MenuAppBar from "../src/Appbar";
import ClientOnly from "../src/ClientOnly";
import Copyright from "../src/Copyright";
import { useMeQuery } from "../src/generated/graphql";
import Link from "../src/Link";
import ProTip from "../src/ProTip";

export default function Index() {
	const { data, loading } = useMeQuery();

	const router = useRouter();

	if (!loading && !data?.me.user?.id) router.push("/signin");

	return (
		<>
			<ClientOnly>
				<MenuAppBar />
			</ClientOnly>
			<Container maxWidth="sm">
				<Box sx={{ my: 4 }}>
					<Typography variant="h4">
						welcome {data?.me.user?.username}
					</Typography>
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
