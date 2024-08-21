import { NextResponse } from "next/server";
// @ts-ignore
import prisma from "@/lib/db";

export const revalidate = 0;

export async function POST(req: any) {
	const body = await req.json(); // Parse the request body

	const { pair, breakupPrices, breakdownPrices, expiresAt, message = "" } = body;

	if (!pair || (!breakupPrices && !breakdownPrices.length)) {
		return NextResponse.json(
			{ error: "Missing required fields" },
			{ status: 400 }
		);
	}

	//@ts-ignore
	const alert = await prisma.alert.create({
		data: {
			pair,
			...(breakupPrices && { breakupPrices }),
			...(breakdownPrices && { breakdownPrices }),
			...(expiresAt && { expiresAt }),
			...(message && { message }),
		},
	});

	return NextResponse.json({ alert });
}
