import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "../../src/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Formik, Form, Field } from "formik";
import { changePasswordSchema } from "../../src/schemas/userSchema";
import { useRouter } from "next/router";
import { useChangePasswordMutation } from "../../src/generated/graphql";
import Copyright from "../../src/Copyright";
import ErrorList from "../../src/ErrorList";

const theme = createTheme();

export default function SignIn() {
	const router = useRouter();
	const [changePassword, { data }] = useChangePasswordMutation();

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
						Change password
					</Typography>
					<Formik
						initialValues={{ newPassword: "", confirmPassword: "" }}
						validationSchema={changePasswordSchema}
						onSubmit={async (values) => {
							const token =
								typeof router.query.token === "string"
									? router.query.token
									: "";
							console.log(values, " token", token);
							const res = await changePassword({
								variables: { changePassword: { ...values, token } },
							});
							if (
								!res.data?.changePassword.errors ||
								res.data?.changePassword.errors.length === 0
							) {
								console.log("password changed successfully");
								router.push("/signin");
							}
							if (res.errors) {
								console.log("error ", res.errors);
							}
						}}
					>
						{({ errors, touched }) => (
							<>
								<ErrorList errors={data?.changePassword.errors} />
								<Form>
									<Field
										as={TextField}
										margin="normal"
										fullWidth
										error={errors.newPassword && touched.newPassword}
										helperText={errors.newPassword}
										name="newPassword"
										label="New Password"
										type="password"
										id="new-password"
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
										Submit
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
