import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function saveLayout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const { userId, clientId, symbol, interval, layout } = req.body;

		try {
			const chartLayout = await prisma.chartLayout.upsert({
				where: {
					userId_clientId_symbol_interval: {
						userId,
						clientId,
						symbol,
						interval,
					},
				},
				update: { layout },
				create: {
					userId,
					clientId,
					symbol,
					interval,
					layout,
				},
			});
			res.status(200).json(chartLayout);
		} catch (error) {
			res.status(500).json({ error: "Error saving chart layout" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
