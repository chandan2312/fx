"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { revalidatePath } from "next/cache";
import React from "react";
import { toast } from "sonner";

const DeleteAlertButton = ({ alert }: { alert: any }) => {
	async function onDelete(id: string) {
		try {
			const res = await axios.delete(`/api/alerts/delete?id=${id}`);
			const status = res.status;
			if (status === 200) {
				toast.success("Event has been deleted");
				revalidatePath("/api/alerts/get");
				window.location.reload();
			}
		} catch (error: any) {
			console.error(error.message);
			toast.error("Error in deleting alert");
		}
	}

	return (
		<span className="cursor-pointer" onClick={() => onDelete(alert.id)}>
			<Trash size={18} color="#cf355e" />
		</span>
	);
};

export default DeleteAlertButton;
