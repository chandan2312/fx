import { NextResponse } from "next/server";
// @ts-ignore
import prisma from "@/lib/db";

export const revalidate = 0;

export async function PUT(req: any) {
	const body = await req.json(); // Parse the request body

	const {
		id,
		pair,
		breakupPrices,
		breakdownPrices,
		expiresAt,
		message,
		triggered,
		rating,
	} = body;

	//@ts-ignore
	const alert = await prisma.alert.update({
		where: { id },
		data: {
			...(pair && { pair }),
			...(breakupPrices && { breakupPrices }),
			...(breakdownPrices && { breakdownPrices }),
			...(expiresAt && { expiresAt }),
			...(message && { message }),
			...(triggered && { triggered }),
			...(rating && { rating: parseInt(rating) }),
		},
	});

	return NextResponse.json({ alert });
}
