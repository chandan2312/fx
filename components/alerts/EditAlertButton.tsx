"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { pairs } from "@/constant";
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
import { Check, ChevronsUpDown, Pen } from "lucide-react";

const formSchema = z.object({
	pair: z.string().min(5).max(50),
	breakupPrice: z.coerce.number().min(0).optional(),
	breakdownPrice: z.coerce.number().min(0).optional(),
	expiresAt: z.string().min(1).max(30),
	message: z.string().optional(),
	triggered: z.boolean().optional(),
});

const expiresAtOptions = [
	{ value: "1", label: "1 day" },
	{ value: "3", label: "3 days" },
	{ value: "7", label: "1 week" },
	{ value: "14", label: "2 weeks" },
	{ value: "21", label: "3 weeks" },
	{ value: "30", label: "1 month" },
];

const EditAlertButton = ({ alert }: { alert: any }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			pair: alert.pair,
			...(alert?.breakupPrice && { breakupPrice: alert.breakupPrice }),
			...(alert?.breakdownPrice && { breakdownPrice: alert.breakdownPrice }),
			...(alert?.message && { message: alert.message }),
			...(alert?.triggered && { triggered: alert.triggered }),
		},
	});

	async function onEdit(values: z.infer<typeof formSchema>) {
		const expiryDate = new Date(
			new Date().getTime() + parseInt(values.expiresAt) * 24 * 60 * 60 * 1000
		);

		const data = {
			id: alert.id,

			expiresAt: expiryDate.toISOString(),
			message: values.message,
		};
		try {
			const res = await axios.put(`/api/alerts/edit`, data);
			const status = res.status;
			if (status === 200) {
				toast.success("Event has been updated");
				revalidatePath("/api/alerts/get");
				window.location.reload();
			}
		} catch (error: any) {
			console.error(error.message);
			toast.error("Error in updating alert");
		}
	}
	return (
		<Drawer>
			<DrawerTrigger>
				<span className="cursor-pointer">
					<Pen size={18} color="#3e6ae2" />
				</span>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Edit Alert</DrawerTitle>
				</DrawerHeader>
				<div>
					<div className="bg-muted/20 p-2 rounded-md shadow-md ">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onEdit)} className="space-y-1">
								<FormField
									control={form.control}
									name="pair"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Pair</FormLabel>
											<FormControl>
												<Input readOnly {...field} />
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>

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

								<div className="pt-3">
									<Button className="my-3 w-full flex justify-center" type="submit">
										Update
									</Button>
								</div>
							</form>
						</Form>
					</div>
				</div>
				<DrawerFooter>
					{/* <Button>Update</Button> */}
					<DrawerClose>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default EditAlertButton;
