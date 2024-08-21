"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { pairs } from "@/constant";
import { ScrollArea } from "@/components/ui/scroll-area";

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
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

const formSchema = z.object({
	pair: z.string().min(5).max(50),
	breakupPrice1: z.coerce.number().min(0).optional(),
	breakupPrice2: z.coerce.number().min(0).optional(),
	breakupPrice3: z.coerce.number().min(0).optional(),
	breakdownPrice1: z.coerce.number().min(0).optional(),
	breakdownPrice2: z.coerce.number().min(0).optional(),
	breakdownPrice3: z.coerce.number().min(0).optional(),
	expiresAt: z.string().min(1).max(30),
	rating: z.coerce.number().min(1).max(5),
	message: z.string().optional(),
});

const expiresAtOptions = [
	{ value: "1", label: "1 day" },
	{ value: "3", label: "3 days" },
	{ value: "7", label: "1 week" },
	{ value: "14", label: "2 weeks" },
	{ value: "21", label: "3 weeks" },
	{ value: "30", label: "1 month" },
];

const AddAlert = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			expiresAt: "7",
			rating: 1,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const expiryDate = new Date(
			new Date().getTime() + parseInt(values.expiresAt) * 24 * 60 * 60 * 1000
		);

		const data = {
			pair: values?.pair,
			breakupPrices: [
				...(values.breakupPrice1 ? [{ price: values.breakupPrice1 }] : []),
				...(values.breakupPrice2 ? [{ price: values.breakupPrice2 }] : []),
				...(values.breakupPrice3 ? [{ price: values.breakupPrice3 }] : []),
			],
			breakdownPrices: [
				...(values.breakdownPrice1 ? [{ price: values.breakdownPrice1 }] : []),
				...(values.breakdownPrice2 ? [{ price: values.breakdownPrice2 }] : []),
				...(values.breakdownPrice3 ? [{ price: values.breakdownPrice3 }] : []),
			],
			...(values?.message && { message: values.message }),
			rating: values.rating || 1,
		};

		try {
			const res = await axios.post("/api/alerts/add", data);
			const status = res.status;
			if (status === 200) {
				toast.success("Event has been created");
				window.location.reload();
			}
		} catch (error: any) {
			console.error(error.message);
			toast.error("Error adding alert");
		}
	}

	return (
		<Drawer>
			<DrawerTrigger>
				<div className="flex items-center justify-center min-w-80 px-2 py-1  mx-auto bg-black text-white rounded-md">
					Add Alert
				</div>
			</DrawerTrigger>
			<DrawerContent className="max-w-7xl mx-auto">
				<DrawerHeader className="flex mx-auto">
					<DrawerTitle>Add New Alert</DrawerTitle>
				</DrawerHeader>

				<div className=" p-4  max-w-3xl mx-auto">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
							{/* <FormField
						control={form.control}
						name="pair"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Pair</FormLabel>
								<FormControl>
									<Input placeholder="USDJPY" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/> */}

							<FormField
								control={form.control}
								name="pair"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Select Pair</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															"w-[200px] justify-between",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value
															? pairs.find((pair) => pair.value === field.value)?.label
															: "Select pair"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-[200px] p-0">
												<Command>
													<CommandInput placeholder="Search Pair" />
													<CommandList>
														<CommandEmpty>No Pair Found</CommandEmpty>
														<CommandGroup>
															{pairs.map((pair: any) => (
																<CommandItem
																	value={pair.value}
																	key={pair.value}
																	onSelect={() => {
																		form.setValue("pair", pair.value);
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			pair.value === field.value ? "opacity-100" : "opacity-0"
																		)}
																	/>
																	{pair.label}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>

										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-between gap-4">
								<div className="space-y-1">
									<span className="text-sm">Breakup</span>
									<FormField
										control={form.control}
										name="breakupPrice1"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="bg-green-500/10"
														placeholder="1.200"
														type="number"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="breakupPrice2"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="bg-green-500/10"
														placeholder="1.21"
														type="number"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="breakupPrice3"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="bg-green-500/10"
														placeholder="1.22"
														type="number"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="space-y-1">
									<span className="text-sm">BreakDowns</span>
									<FormField
										control={form.control}
										name="breakdownPrice1"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="bg-red-500/10"
														placeholder="0.99"
														type="number"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="breakdownPrice2"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="bg-red-500/10"
														placeholder="0.98"
														type="number"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="breakdownPrice3"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="bg-red-500/10"
														placeholder="0.97"
														type="number"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<FormField
								control={form.control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Message</FormLabel>
										<FormControl>
											<Input placeholder="Add note" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="rating"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rating</FormLabel>
										<FormControl>
											<Input type="number" placeholder="Rating" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="expiresAt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expires At</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange}>
												<SelectTrigger className="w-full bg-muted/20">
													<SelectValue placeholder="Duration" />
												</SelectTrigger>
												<SelectContent>
													{expiresAtOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="pt-3">
								<Button className="my-3 w-full flex justify-center" type="submit">
									Add Alert
								</Button>
							</div>
						</form>
					</Form>
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

export default AddAlert;
