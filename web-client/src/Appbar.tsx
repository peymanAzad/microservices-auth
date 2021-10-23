import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import {
	useLogoutMutation,
	useMeQuery,
	useRevokeTokenMutation,
} from "./generated/graphql";
import { useRouter } from "next/router";
import { setAccessToken } from "./tools/accessToken";

export default function MenuAppBar() {
	const [revokeToken] = useRevokeTokenMutation();
	const [logout, { client }] = useLogoutMutation();
	const { data } = useMeQuery();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleRevokeToken = async () => {
		const { data, errors } = await revokeToken();
		if (errors && errors?.length > 0)
			console.log("error on revoke token", errors);
		if (
			data?.revokeRefreshTokens.errors &&
			data?.revokeRefreshTokens.errors.length > 0
		)
			console.log(
				"server error on revoke token",
				data?.revokeRefreshTokens.errors
			);
		if (data?.revokeRefreshTokens.result) {
			console.log("token revoked seccessfully. now loggin out...");
		}
		await handleLogout();
	};

	const handleLogout = async () => {
		const { data, errors } = await logout();
		if (errors && errors?.length > 0) console.log("error on logout", errors);
		setAccessToken("");
		await client.resetStore();
		if (data?.logout) {
			console.log("loging out seccessful");
		}
		handleClose();
		router.push("/signin");
	};

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Lorem ipsum
					</Typography>

					<div>
						<Typography variant="body1" component="span">
							{data?.me.user?.username}
						</Typography>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleMenu}
							color="inherit"
						>
							<AccountCircle />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							keepMounted
							transformOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							open={Boolean(anchorEl)}
							onClose={handleClose}
						>
							<MenuItem onClick={handleRevokeToken}>Revoke Token</MenuItem>
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
					</div>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
