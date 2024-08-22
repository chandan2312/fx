import axios from "axios";
import { pairs } from "../../constant";
//@ts-ignore
import prisma from "../../lib/db";
import { sendTelegramNotification } from "../other/send-to-telegram";

async function notify() {
	//@ts-ignore
	let allAlerts;
	let livePrices;

	let msg = [];

	try {
		//@ts-ignore
		allAlerts = await prisma.alert.findMany();
	} catch (error: any) {
		console.error("Error fetching alerts:", error.message);
		await sendTelegramNotification("🔴 Error fetching alerts");
		await new Promise((resolve) => setTimeout(resolve, 30000));

		process.exit(1);
	}

	try {
		const url = `https://mds-api.forexfactory.com/instruments?instruments=${pairs
			.map((pair: any) => pair.value)
			.join(",")}`;
		const { data } = await axios.get(url);

		livePrices = data.data.map((pair: any) => {
			const { instrument, metrics } = pair;
			const single = {
				pair: instrument.name.replace("/", "%2F"),
				price: metrics.M5.price,
			};

			return single;
		});

		console.log("Live prices:", livePrices);
	} catch (error: any) {
		console.error("Error fetching live prices:", error.message);
		await sendTelegramNotification("🔴 Error fetching live prices");
		await new Promise((resolve) => setTimeout(resolve, 30000));

		process.exit(1);
	}

	for (const alert of allAlerts) {
		const { pair, breakupPrices, breakdownPrices, expiresAt, message } = alert;

		for (const livePrice of livePrices) {
			if (pair === livePrice.pair) {
				//------------ Breakup ------------

				if (
					breakupPrices.filter((item: any) => {
						return !item?.triggeredAt;
					})?.length
				) {
					for (const item of breakupPrices) {
						if (livePrice.price >= item.price && !item?.triggeredAt) {
							msg.push({
								pair,
								price: item.price,
								type: "breakup",
								...(alert?.message && { message: alert.message }),
							});

							//update db triggeredAt

							try {
								//@ts-ignore
								const updatedAlert = await prisma.alert.update({
									where: { id: alert.id },
									data: {
										breakupPrices: {
											set: [
												{
													...item,
													triggeredAt: new Date(),
												},
											],
										},
									},
								});
							} catch (error: any) {
								console.error("Error updating alert:", error.message);
								await sendTelegramNotification(
									"🔴 Error updating alert" + error.message
								);
								await new Promise((resolve) => setTimeout(resolve, 30000));

								process.exit(1);
							}
						}
					}
				}

				//------------ Breakdown ------------

				if (
					breakdownPrices.filter((item: any) => {
						return !item?.triggeredAt;
					})?.length
				) {
					for (const item of breakdownPrices) {
						if (item.price >= livePrice.price && !item?.triggeredAt) {
							msg.push({
								pair,
								price: item.price,
								type: "breakdown",
							});

							//update db triggeredAt

							try {
								//@ts-ignore
								const updatedAlert = await prisma.alert.update({
									where: { id: alert.id },
									data: {
										breakdownPrices: {
											set: [
												{
													...item,
													triggeredAt: new Date(),
												},
											],
										},
									},
								});
							} catch (error: any) {
								console.error("Error updating alert:", error.message);
								await sendTelegramNotification(
									"🔴 Error updating alert" + error.message
								);
								await new Promise((resolve) => setTimeout(resolve, 30000));

								process.exit(1);
							}
						}
					}
				}
			}
		}
	}

	// send notification
	if (!msg?.length) {
		console.log("No alerts triggered");
		await new Promise((resolve) => setTimeout(resolve, 30000));

		process.exit(0);
	}

	const template = msg
		.map((item: any) => {
			return `${item?.message ? item.message + "\n" : ""}${item.pair.replace(
				"%2F",
				"/"
			)} ${item.type == "breakup" ? "🟢" : "🔴"} ${item.price}`;
		})
		.join("\n");

	console.log("Alerts triggered:", template);

	try {
		await sendTelegramNotification(template);
	} catch (error: any) {
		console.error("Error sending notification:", error.message);
		await sendTelegramNotification("🔴 Error sending notification");
		//30 second pause, timeout
		await new Promise((resolve) => setTimeout(resolve, 30000));
		process.exit(1);
	}
	await new Promise((resolve) => setTimeout(resolve, 30000));

	process.exit(0);
}

notify();
