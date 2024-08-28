"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { pairs } from "@/constant";

import {
	CheckCheck,
	Clock,
	Delete,
	Edit,
	Hourglass,
	Pen,
	Plus,
	Star,
	Trash,
	X,
} from "lucide-react";
import AddAlert from "@/components/alerts/AddAlert";
import { cn, timeAgo, timeLeft } from "@/lib/utils";
import DeleteAlertButton from "@/components/alerts/DeleteAlertButton";
import EditAlertButton from "@/components/alerts/EditAlertButton";
import { Input } from "@/components/ui/input";
import { set } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import TVChart from "@/components/chart/TVChart";
import PopupChart from "@/components/chart/PopupChart";

const Alerts = () => {
	const [alertList, setAlertList] = React.useState([]);
	const [newBreakupPrice, setNewBreakupPrice] = React.useState(0);
	const [newBreakdownPrice, setNewBreakdownPrice] = React.useState(0);
	const starArr = [1, 2, 3, 4, 5];
	const [rating, setRating] = useState(0);

	async function fetchData() {
		const res = await axios.get("/api/alerts/get");
		const data = res.data.alerts;

		if (!data?.length) {
			setAlertList([]);
			return;
		}

		data.sort((a: any, b: any) => {
			return b.rating - a.rating;
		});

		setAlertList(data);
	}

	useEffect(() => {
		fetchData();
	}, []);

	async function addPrice(type: string, price: number, alert: any) {
		const data = {
			id: alert.id,
		};

		if (type === "breakupPrice") {
			// @ts-ignore
			data.breakupPrices = [...alert?.breakupPrices, { price }];
		} else {
			// @ts-ignore
			data.breakdownPrices = [...alert?.breakdownPrices, { price }];
		}
		try {
			const res = await axios.put("/api/alerts/edit", data);
			const status = res.status;
			if (status === 200) {
				await fetchData();
				toast.success("Price added");
			}
		} catch (error: any) {
			console.error(error.message);
			toast.error("Error in adding price");
		}
	}

	async function removePrice(type: string, price: number, alert: any) {
		const data = {
			id: alert.id,
		};

		if (type === "breakupPrice") {
			// @ts-ignore
			data.breakupPrices = alert?.breakupPrices.filter(
				//@ts-ignore
				(item: any) => parseFloat(item.price) != parseFloat(price)
			);
		} else {
			// @ts-ignore
			data.breakdownPrices = alert?.breakdownPrices.filter(
				// @ts-ignore
				(item: any) => parseFloat(item.price) != parseFloat(price)
			);
		}

		try {
			const res = await axios.put("/api/alerts/edit", data);
			const status = res.status;
			if (status === 200) {
				await fetchData();
				toast.success("Price deleted");
			}
		} catch (error: any) {
			console.error(error.message);
			toast.error("Error in deleting price");
		}
	}

	const handleRating = async (rate: number, id: any) => {
		try {
			const res = await axios.put(`/api/alerts/edit`, {
				id: id,
				rating: rate,
			});

			const status = res.status;
			if (status === 200) {
				setRating(rate);
				toast.success("Rating updated");
				fetchData();
			}
		} catch (error: any) {
			console.error(error.message);
			toast.error("Error in updating rating");
		}
	};

	return (
		<div className="max-w-6xl mx-auto p-4 ">
			<div className="flex items-center justify-center">
				<AddAlert />
			</div>

			<div>
				<h2 className="my-4 first-line:text-lg font-semibold">Alerts</h2>

				<div className="space-y-4">
					{alertList?.length
						? alertList?.map((alert: any) => {
								const merged = [
									...alert?.breakupPrices.map((item: any) => ({
										...item,
										type: "breakupPrice",
									})),
									...alert?.breakdownPrices.map((item: any) => ({
										...item,
										type: "breakdownPrice",
									})),
								];

								const last4 = merged
									.filter((item: any) => item?.triggeredAt)
									.sort(
										(a: any, b: any) =>
											new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
									)
									.slice(0, 4);

								return (
									<div
										key={alert.id}
										className="p-1  rounded-md  shadow-sm border  md:gap-4 max-md:gap-2 flex max-md:flex-col items-center justify-between"
									>
										<div className="flex-shrink">
											<div className="w-full flex justify-between items-center gap-2 font-semibold my-2">
												<span>{alert.pair.replace("%2F", "/")}</span>
												{alert?.message ? (
													<p className="text-xs  font-light pr-2">{alert.message}</p>
												) : (
													""
												)}

												<div className="flex items-center gap-2 h-3 ">
													{starArr.map((item: any, index: number) => {
														return (
															<span key={index + 1} className={cn("cursor-pointer")}>
																<Star
																	color={index + 1 <= alert?.rating ? "#47a0df" : "#b5b5b5"}
																	onClick={() => handleRating(index + 1, alert.id)}
																/>
															</span>
														);
													})}
												</div>
											</div>
											<div className="w-full flex justify-between items-center">
												<div className="flex gap-4">
													{/* --------------------- BREAKUP ------------------- */}
													<div className="space-y-1">
														{alert?.breakupPrices?.filter((price: any) => !price?.triggeredAt)
															.length
															? alert?.breakupPrices
																	?.filter((price: any) => !price?.triggeredAt)
																	?.map((item: any, index: number) => (
																		<div
																			key={index}
																			className="flex items-center justify-between gap-2"
																		>
																			<div
																				className={cn(
																					"text-sm w-40 h-8 bg-green-500/20 px-2 py-1 rounded-md flex items-center justify-between",
																					item?.triggered && "bg-muted"
																				)}
																			>
																				<span className="text-center">{item.price}</span>
																			</div>
																			<span
																				onClick={() =>
																					removePrice("breakupPrice", item.price, alert)
																				}
																				className="cursor-pointer rounded-full bg-green-500 text-white"
																			>
																				<X size={16} />
																			</span>
																		</div>
																	))
															: ""}

														<div className="mt-2 flex items-center justify-between gap-1">
															<Input
																type="number"
																onChange={(e: any) => setNewBreakupPrice(e.target.value)}
																className="h-8 bg-green-500/5 border border-green-500 w-40"
															/>{" "}
															<span
																className="cursor-pointer"
																onClick={() => {
																	if (!newBreakupPrice) {
																		toast.error("Please enter a price");
																		return;
																	}
																	//@ts-ignore
																	addPrice("breakupPrice", parseFloat(newBreakupPrice), alert);
																}}
															>
																<Plus size={18} color="#2f914b" />
															</span>
														</div>
													</div>

													{/* --------------------- BREAKDOWN ------------------- */}

													<div className="space-y-1">
														{alert?.breakdownPrices.filter(
															(price: any) => !price?.triggeredAt
														)?.length
															? alert?.breakdownPrices
																	.filter((price: any) => !price?.triggeredAt)
																	?.map((item: any, index: number) => (
																		<div
																			key={index}
																			className="flex items-center justify-between gap-2"
																		>
																			<div
																				className={cn(
																					"text-sm w-40 h-8 bg-red-500/20 px-2 py-1 rounded-md flex items-center justify-between",
																					item?.triggered && "bg-muted"
																				)}
																			>
																				<span className="text-center">{item.price}</span>
																			</div>
																			<span
																				onClick={() =>
																					removePrice("breakdownPrice", item.price, alert)
																				}
																				className="cursor-pointer rounded-full bg-red-500 text-white"
																			>
																				<X size={16} />
																			</span>
																		</div>
																	))
															: ""}
														<div className="mt-1 flex items-center justify-between gap-1">
															<Input
																type="number"
																onChange={(e: any) => setNewBreakdownPrice(e.target.value)}
																className="h-8 bg-red-500/5 border border-red-500 w-40"
															/>{" "}
															<span
																className="cursor-pointer"
																onClick={() => {
																	if (!newBreakdownPrice) {
																		toast.error("Please enter a price");
																		return;
																	}

																	addPrice(
																		"breakdownPrice",
																		//@ts-ignore
																		parseFloat(newBreakdownPrice),
																		alert
																	);
																}}
															>
																<Plus size={18} color="#cd2656" />
															</span>
														</div>
													</div>
												</div>
											</div>

											<Separator className="my-2" />

											<div className="text-xs flex-shrink flex gap-4 items-center justify-between">
												<div className="flex gap-1 items-center">
													{/* <span className="text-xs font-semibold">
														<Clock size={18} />
													</span> */}
													<div className="flex gap-2">
														{last4?.map((item: any, index: number) => {
															return (
																<div
																	key={index}
																	className={cn(
																		"text-xs rounded-md px-1 ",
																		item.type === "breakupPrice"
																			? "text-green-600 border border-green-500"
																			: "text-red-500 border border-red-500"
																	)}
																>
																	<span className="block">{item.price}</span>
																	<span className="font-light text-foreground">
																		{timeAgo(item?.triggeredAt)}
																	</span>
																</div>
															);
														})}
													</div>
												</div>
												<div className="flex gap-2 items-center">
													<PopupChart
														symbol={
															//@ts-ignore
															pairs?.find((item: any) => item.value === alert.pair).symbol
														}
														interval={alert.rating == 5 ? "15" : "60"}
													/>
													<EditAlertButton alert={alert} />
													<DeleteAlertButton alert={alert} />
												</div>
											</div>
										</div>

										{/* --------------- Chart ------------------

										{alert?.rating >= 3 ? (
											<div className="flex-grow tradingview-chart w-full h-80">
												<TVChart
													//@ts-ignore
													symbol={
														//@ts-ignore
														pairs?.find((item: any) => item.value === alert.pair).symbol
													}
													interval={alert.rating == 5 ? "15" : "60"}
													clientId="fxtools"
													userId="chandan23"
												/>
											</div>
										) : (
											""
										)} */}
									</div>
								);
						  })
						: "No alerts found"}
				</div>
			</div>
		</div>
	);
};

export default Alerts;
