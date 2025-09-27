import axios from "axios";
import prisma from "../../../lib/db";
import { sendTelegramNotification } from "../../../actions/other/send-to-telegram";
import { pairs } from "../../../constant";

export async function POST(request: Request) {
  let allAlerts;
  let livePrices;
  const msg: any[] = [];

  try {
    // Fetch all alerts from the database
    allAlerts = await prisma.alert.findMany();
  } catch (error: any) {
    console.error("Error fetching alerts:", error.message);
    await sendTelegramNotification("🔴 Error fetching alerts");
    return new Response(JSON.stringify({ message: "Error fetching alerts" }), { status: 500 });
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
    return new Response(JSON.stringify({ message: "Error fetching live prices" }), { status: 500 });
  }

  // Process alerts
  for (const alert of allAlerts) {
    const { pair, breakupPrices, breakdownPrices } = alert;

    for (const livePrice of livePrices) {
      if (pair === livePrice.pair) {
        //------------ Breakup ------------
        if (breakupPrices.filter((item: any) => !item?.triggeredAt)?.length) {
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
                await sendTelegramNotification("🔴 Error updating alert " + error.message);
                return new Response(JSON.stringify({ message: "Error updating alert" }), { status: 500 });
              }
            }
          }
        }

        //------------ Breakdown ------------
        if (breakdownPrices.filter((item: any) => !item?.triggeredAt)?.length) {
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
                await sendTelegramNotification("🔴 Error updating alert " + error.message);
                return new Response(JSON.stringify({ message: "Error updating alert" }), { status: 500 });
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
    return new Response(JSON.stringify({ message: "No alerts triggered" }), { status: 200 });
  }

  const template = msg
    .map((item: any) => {
      return `${item?.message ? item.message + "\n" : ""}${item.pair.replace("%2F", "/")} ${
        item.type === "breakup" ? "🟢" : "🔴"
      } ${item.price}`;
    })
    .join("\n");

  console.log("Alerts triggered:", template);

  try {
    await sendTelegramNotification(template);
  } catch (error: any) {
    console.error("Error sending notification:", error.message);
    await sendTelegramNotification("🔴 Error sending notification");
    return new Response(JSON.stringify({ message: "Error sending notification" }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Alerts processed and notifications sent" }), { status: 200 });
}
