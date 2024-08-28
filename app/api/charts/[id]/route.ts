import type { NextApiRequest, NextApiResponse } from "next";
//@ts-ignore
import prisma from "../../../../lib/db"; // Adjust the import path as needed

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (req.method === "GET") {
		try {
			//@ts-ignore
			const chart = await prisma.chartLayout.findUnique({
				where: { id: id as string },
			});
			if (chart) {
				res.status(200).json(chart);
			} else {
				res.status(404).json({ error: "Chart not found" });
			}
		} catch (error) {
			res.status(500).json({ error: "Error loading chart" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
