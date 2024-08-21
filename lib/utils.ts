import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function timeLeft(dateString: any) {
	const date: any = new Date(dateString);
	const now: any = new Date();
	const seconds = Math.floor((date - now) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) {
		return `${seconds} seconds left`;
	} else if (minutes < 60) {
		return `${minutes} minutes left`;
	} else if (hours < 24) {
		return `${hours} hours left`;
	} else if (days < 30) {
		return `${days} days left`;
	} else {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return date.toLocaleDateString("en-GB", options);
	}
}

export function timeAgo(dateString: any) {
	const date: any = new Date(dateString);
	const now: any = new Date();
	const seconds = Math.floor((now - date) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) {
		return `${seconds}S ago`;
	} else if (minutes < 60) {
		return `${minutes}M ago`;
	} else if (hours < 24) {
		return `${hours}H ago`;
	} else if (days < 7) {
		return `${days}D ago`;
	} else {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return date.toLocaleDateString("en-GB", options);
	}
}
