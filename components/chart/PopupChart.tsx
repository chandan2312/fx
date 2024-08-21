"use client";

import React, { useEffect, useRef, memo } from "react";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import TVChart from "./TVChart";
import { Maximize } from "lucide-react";
import TVChart2 from "./TVChart2";

const PopupChart = ({
	symbol,
	interval,
}: {
	symbol: any;
	interval: string;
}) => {
	const container = useRef();

	return (
		<Drawer>
			<DrawerTrigger>
				<Maximize size={18} />
			</DrawerTrigger>
			<DrawerContent className="h-[90%]">
				<DrawerHeader>
					<DrawerTitle>{symbol}</DrawerTitle>
				</DrawerHeader>

				<div className="w-full h-full">
					<TVChart2 symbol={symbol} interval={interval} />
				</div>

				<DrawerFooter>
					<DrawerClose>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default memo(PopupChart);
