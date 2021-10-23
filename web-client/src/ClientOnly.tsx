import * as React from "react";

const ClientOnly: React.FC = ({ children, ...delegated }) => {
	const [hasMounted, setHasMounted] = React.useState(false);

	React.useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) {
		return null;
	}

	return <div {...delegated}>{children}</div>;
};
export default ClientOnly;
