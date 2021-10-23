import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ProTip from "../src/ProTip";
import Link from "../src/Link";
import Copyright from "../src/Copyright";
import { useRouter } from "next/router";
import { useMeQuery } from "../src/generated/graphql";
import MenuAppBar from "../src/Appbar";

export default function About() {
	const { data, loading } = useMeQuery({ fetchPolicy: "no-cache" });
	const router = useRouter();
	if (!loading && !data?.me.user?.id) {
		router.push("/signin");
	}
	return (
		<>
			<MenuAppBar />
			<Container maxWidth="sm">
				<Box sx={{ my: 4 }}>
					<Typography variant="h4" component="h1" gutterBottom>
						Lorem ipsum, dolor sit amet consectetur adipisicing elit. Alias
						culpa doloribus praesentium nisi fugiat, numquam iste unde deserunt.
						Dignissimos praesentium mollitia laborum debitis quibusdam?
					</Typography>
					<Button variant="contained" component={Link} noLinkStyle href="/">
						Go to the main page
					</Button>
					<ProTip />
					<Copyright />
				</Box>
			</Container>
		</>
	);
}
