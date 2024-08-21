import React from "react";
import { ModeToggle } from "../other/ModeToggle";

const Navbar = () => {
	return (
		<div className="max-w-7xl mx-auto bg-card flex items-center justify-between gap-2  w-full border-b-2 border-muted">
			<div className="font-semibol">FXTOOLS</div>
			<ModeToggle />
		</div>
	);
};

export default Navbar;
