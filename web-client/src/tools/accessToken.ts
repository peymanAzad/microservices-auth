let accessToken = "";

export const setAccessToken = (s: string) => {
	accessToken = s;
};

export const fetchAccessToken = async () => {
	console.log("access token called");
	if (accessToken === "" || !accessToken) {
		const response = await fetch(
			process.env.NEXT_PUBLIC_API_URL_REFRESH_TOKEN!,
			{
				method: "POST",
				credentials: "include",
			}
		);
		const json = await response.json();
		accessToken = json.accessToken as string;
	}
	return accessToken;
};

export const getAccessToken = () => {
	return accessToken;
};
