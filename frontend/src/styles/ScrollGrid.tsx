import React, { forwardRef, type ReactNode } from "react";
import { Grid2 } from "@mui/material";

interface Props {
	children: ReactNode;
	height?: number;
}

const ScrollGrid = forwardRef<HTMLDivElement, Props>(({ children, height = 500 }: Props, ref) => (
	<Grid2
		ref={ref}
		sx={{
			height,
			overflowY: "auto",
		}}
	>
		{children}
	</Grid2>
));

ScrollGrid.displayName = "ScrollGrid";

export default ScrollGrid;
