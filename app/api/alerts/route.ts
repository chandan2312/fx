import axios from "axios";
import { pairs } from "../../../constant";
//@ts-ignore
import prisma from "../../../lib/db";
import { sendTelegramNotification } from "../../../actions/other/send-to-telegram";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    //@ts-ignore
    let allAlerts;
    let livePrices;

    let msg = [];

    try {
        // Fetch all alerts from the database
        //@ts-ignore
        allAlerts = await prisma.alert.findMany();
    } catch (error: any) {
        console.error("Error fetching alerts:", error.message);
        await sendTelegramNotification("🔴 Error fetching alerts");
        return res.status(500).json({ message: 'Error fetching alerts' });
    }

    try {
        // Fetch live prices from external API
        const url = `https://mds-api.forexfactory.com/instruments?instruments=${pairs
            .map((pair: any) => pair.value)
            .join(",")}`;
        const { data } = await axios.get(url);

        livePrices = data.data.map((pair: any) => {
            const { instrument, metrics } = pair;
            return {
                pair: instrument.name.replace("/", "%2F"),
                price: metrics.M5.price,
            };
        });

        console.log("Live prices:", livePrices);
    } catch (error: any) {
        console.error("Error fetching live prices:", error.message);
        await sendTelegramNotification("🔴 Error fetching live prices");
        return res.status(500).json({ message: 'Error fetching live prices' });
    }

    // Process alerts
    for (const alert of allAlerts) {
        const { pair, breakupPrices, breakdownPrices } = alert;

        for (const livePrice of livePrices) {
            if (pair === livePrice.pair) {
                //------------ Breakup ------------
                if (
                    breakupPrices.filter((item: any) => !item?.triggeredAt)?.length
                ) {
                    for (const item of breakupPrices) {
                        if (livePrice.price >= item.price && !item?.triggeredAt) {
                            msg.push({
                                pair,
                                price: item.price,
                                type: "breakup",
                                ...(alert?.message && { message: alert.message }),
                            });

                            // Update db triggeredAt for breakup
                            try {
                                await prisma.alert.update({
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
                                return res.status(500).json({ message: 'Error updating alert' });
                            }
                        }
                    }
                }

                //------------ Breakdown ------------
                if (
                    breakdownPrices.filter((item: any) => !item?.triggeredAt)?.length
                ) {
                    for (const item of breakdownPrices) {
                        if (item.price >= livePrice.price && !item?.triggeredAt) {
                            msg.push({
                                pair,
                                price: item.price,
                                type: "breakdown",
                            });

                            // Update db triggeredAt for breakdown
                            try {
                                await prisma.alert.update({
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
                                return res.status(500).json({ message: 'Error updating alert' });
                            }
                        }
                    }
                }
            }
        }
    }

    // Send notification
    if (!msg?.length) {
        console.log("No alerts triggered");
        return res.status(200).json({ message: "No alerts triggered" });
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
        return res.status(500).json({ message: 'Error sending notification' });
    }

    return res.status(200).json({ message: "Alerts processed and notifications sent" });
}
