import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Link from "../src/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Field, Form, Formik } from "formik";
import * as React from "react";
import Copyright from "../src/Copyright";
import {
	MeDocument,
	MeQuery,
	useRegisterMutation,
} from "../src/generated/graphql";
import { registerSchema } from "../src/schemas/userSchema";
import { useRouter } from "next/router";
import ErrorList from "../src/ErrorList";
import { setAccessToken } from "../src/tools/accessToken";

const theme = createTheme();

export default function SignUp() {
	const router = useRouter();
	const [register, { data }] = useRegisterMutation();

	return (
		<ThemeProvider theme={theme}>
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<Box
					sx={{
						marginTop: 4,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						Sign up
					</Typography>
					<Formik
						initialValues={{
							email: "",
							username: "",
							password: "",
							confirmPassword: "",
						}}
						validationSchema={registerSchema}
						onSubmit={async (values) => {
							console.log(values);
							const res = await register({
								variables: { input: values },
								update: (store, { data }) => {
									if (!data) return null;
									store.writeQuery<MeQuery>({
										query: MeDocument,
										data: {
											__typename: "Query",
											me: data.register,
										},
									});
								},
							});
							if (
								!res.data?.register.errors ||
								res.data?.register.errors.length === 0
							) {
								console.log("register successfully");
								setAccessToken(res.data?.register.access_token!);
								router.push("/");
							}
							if (res.errors) {
								console.log("error ", res.errors);
							}
						}}
					>
						{({ errors, touched }) => (
							<>
								<ErrorList errors={data?.register.errors} />
								<Form>
									<Field
										as={TextField}
										margin="normal"
										fullWidth
										id="email"
										error={errors.email && touched.email}
										helperText={errors.email}
										label="Email"
										name="email"
										autoComplete="email"
										autoFocus
									/>
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
									<Field
										as={TextField}
										margin="normal"
										fullWidth
										error={errors.confirmPassword && touched.confirmPassword}
										helperText={errors.confirmPassword}
										name="confirmPassword"
										label="Confrim Password"
										type="password"
										id="confirm-password"
										autoComplete="confirm-password"
									/>
									<Button
										type="submit"
										fullWidth
										variant="contained"
										sx={{ mt: 3, mb: 2 }}
									>
										Sign Up
									</Button>
									<Grid container justifyContent="flex-end">
										<Grid item>
											<Link href="/signin" variant="body2">
												Already have an account? Sign in
											</Link>
										</Grid>
									</Grid>
								</Form>
							</>
						)}
					</Formik>
				</Box>
				<Copyright sx={{ mt: 5 }} />
			</Container>
		</ThemeProvider>
	);
}
