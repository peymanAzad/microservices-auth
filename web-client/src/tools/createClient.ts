import {
	fetchAccessToken,
	getAccessToken,
	setAccessToken,
} from "./accessToken";
import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloLink,
	Observable,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";
const cache = new InMemoryCache({});

const requestLink = new ApolloLink(
	(operation, forward) =>
		new Observable((observer) => {
			let handle: any;
			fetchAccessToken().then((token) => {
				Promise.resolve(operation)
					.then((operation) => {
						const accessToken = token;
						if (accessToken) {
							operation.setContext({
								headers: {
									authorization: `bearer ${accessToken}`,
								},
							});
						}
					})
					.then(() => {
						handle = forward(operation).subscribe({
							next: observer.next.bind(observer),
							error: observer.error.bind(observer),
							complete: observer.complete.bind(observer),
						});
					})
					.catch(observer.error.bind(observer));
			});
			return () => {
				if (handle) handle.unsubscribe();
			};
		})
);

export const createClient = () =>
	new ApolloClient({
		ssrMode: typeof window === "undefined",
		link: ApolloLink.from([
			new TokenRefreshLink({
				accessTokenField: "accessToken",
				isTokenValidOrUndefined: () => {
					const token = getAccessToken();

					if (!token) {
						return true;
					}

					try {
						const { exp } = jwtDecode(token) as any;
						if (Date.now() >= exp * 1000) {
							return false;
						} else {
							return true;
						}
					} catch {
						return false;
					}
				},
				fetchAccessToken: () => {
					return fetch(process.env.NEXT_PUBLIC_API_URL_REFRESH_TOKEN!, {
						method: "POST",
						credentials: "include",
					});
				},
				handleFetch: (accessToken) => {
					setAccessToken(accessToken);
				},
				handleError: (err) => {
					console.warn("Your refresh token is invalid. Try to relogin");
					console.error(err);
				},
			}),
			onError(({ graphQLErrors, networkError }) => {
				if (graphQLErrors)
					graphQLErrors.forEach(({ message, locations, path }) =>
						console.log(
							`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
						)
					);
				if (networkError) console.log(`[Network error]: ${networkError}`);
			}),
			requestLink,
			new HttpLink({
				uri: process.env.NEXT_PUBLIC_API_URL_GRAPHQL,
				credentials: "include",
			}),
		]),
		cache,
	});
