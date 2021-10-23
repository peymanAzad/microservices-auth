import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "../src/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Formik, Form, Field } from "formik";
import { loginSchema } from "../src/schemas/userSchema";
import {
	MeDocument,
	MeQuery,
	useLoginMutation,
} from "../src/generated/graphql";
import Copyright from "../src/Copyright";
import { useRouter } from "next/router";
import ErrorList from "../src/ErrorList";
import { setAccessToken } from "../src/tools/accessToken";

const theme = createTheme();

export default function SignIn() {
	const router = useRouter();
	const [login, { data }] = useLoginMutation();

	return (
		<ThemeProvider theme={theme}>
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<Box
					sx={{
						marginTop: 8,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						Sign in
					</Typography>
					<Formik
						initialValues={{ username: "", password: "" }}
						validationSchema={loginSchema}
						onSubmit={async (values) => {
							console.log(values);
							const res = await login({
								variables: { input: values },
								update: (store, { data }) => {
									if (!data) return null;
									store.writeQuery<MeQuery>({
										query: MeDocument,
										data: {
											__typename: "Query",
											me: data.login,
										},
									});
								},
							});
							if (
								!res.data?.login.errors ||
								res.data?.login.errors.length === 0
							) {
								console.log("logged in successfully");
								setAccessToken(res.data?.login.access_token!);
								router.push("/");
							}
							if (res.errors) {
								console.log("error ", res.errors);
							}
						}}
					>
						{({ errors, touched }) => (
							<>
								<ErrorList errors={data?.login.errors} />
								<Form>
									<Field
										as={TextField}
										margin="normal"
										fullWidth
										id="username"
										error={errors.username && touched.username}
										helperText={errors.username}
										label="Username"
										name="username"
										autoComplete="username"
										autoFocus
									/>
									<Field
										as={TextField}
										margin="normal"
										fullWidth
										error={errors.password && touched.password}
										helperText={errors.password}
										name="password"
										label="Password"
										type="password"
										id="password"
										autoComplete="current-password"
									/>
									<Button
										type="submit"
										fullWidth
										variant="contained"
										sx={{ mt: 3, mb: 2 }}
									>
										Sign In
									</Button>
									<Grid container>
										<Grid item xs>
											<Link href="/forget_password" variant="body2">
												Forgot password?
											</Link>
										</Grid>
										<Grid item>
											<Link href="/signup" variant="body2">
												{"Don't have an account? Sign Up"}
											</Link>
										</Grid>
									</Grid>
								</Form>
							</>
						)}
					</Formik>
				</Box>
				<Copyright sx={{ mt: 8, mb: 4 }} />
			</Container>
		</ThemeProvider>
	);
}
