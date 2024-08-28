import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function loadLayout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		const { userId, clientId, symbol, interval } = req.query;

		try {
			const chartLayout = await prisma.chartLayout.findUnique({
				where: {
					userId_clientId_symbol_interval: {
						userId: userId as string,
						clientId: clientId as string,
						symbol: symbol as string,
						interval: interval as string,
					},
				},
			});

			if (chartLayout) {
				res.status(200).json({ layout: chartLayout.layout });
			} else {
				res.status(404).json({ error: "Chart layout not found" });
			}
		} catch (error) {
			res.status(500).json({ error: "Error loading chart layout" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
