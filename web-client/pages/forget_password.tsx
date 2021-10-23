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
import { useForgetPasswordMutation } from "../src/generated/graphql";
import { forgetPasswordSchema } from "../src/schemas/userSchema";
import ErrorList from "../src/ErrorList";

const theme = createTheme();

export default function ForgetPassword() {
	const [forgetPassword, { data, loading }] = useForgetPasswordMutation();

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
						Forget Password
					</Typography>
					<Formik
						initialValues={{
							email: "",
						}}
						validationSchema={forgetPasswordSchema}
						onSubmit={async (values) => {
							console.log(values);
							const res = await forgetPassword({
								variables: { email: values.email },
							});
							if (
								!res.data?.forgetPassword.errors ||
								res.data?.forgetPassword.errors.length === 0
							) {
								console.log("logged in successfully");
							}
							if (res.errors) {
								console.log("error ", res.errors);
							}
						}}
					>
						{({ errors, touched }) => (
							<>
								{!loading && data?.forgetPassword.result && (
									<Typography sx={{ mt: 3 }} variant="body1" color="green">
										we sent you an email for changing your password
									</Typography>
								)}
								<ErrorList errors={data?.forgetPassword.errors} />
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
									<Button
										type="submit"
										fullWidth
										variant="contained"
										sx={{ mt: 3, mb: 2 }}
									>
										Submit
									</Button>
									<Grid container>
										<Grid item xs>
											<Link href="/signup" variant="body2">
												Create New Account
											</Link>
										</Grid>
										<Grid item>
											<Link href="/signin" variant="body2">
												Sign In
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
