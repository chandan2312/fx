import { NextResponse } from "next/server";
// @ts-ignore
import prisma from "@/lib/db";

export async function DELETE(req: any) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");

	//@ts-ignore
	const alert = await prisma.alert.delete({
		where: { id },
	});

	return NextResponse.json({ alert });
}
