import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";

interface ErrorListProps {
	errors?: { field: string; message: string }[] | null;
}

const ErrorList: React.FC<ErrorListProps> = ({ errors }) => {
	return (
		<Box component="ul" sx={{ listStyle: "none" }}>
			{errors?.map((err, index) => (
				<li key={index}>
					<Typography variant="body1" color="error">
						{err.field}: {err.message}
					</Typography>
				</li>
			))}
		</Box>
	);
};
export default ErrorList;
