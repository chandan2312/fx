import { NextResponse } from "next/server";
// @ts-ignore
import prisma from "@/lib/db";

export async function GET(req: any) {
	//@ts-ignore
	const alerts = await prisma.Alert.findMany();
	return NextResponse.json({ alerts });
}
