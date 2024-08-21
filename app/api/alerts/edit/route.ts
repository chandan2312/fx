import { NextResponse } from "next/server";
// @ts-ignore
import prisma from "@/lib/db";

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
		},
	});

	return NextResponse.json({ alert });
}
