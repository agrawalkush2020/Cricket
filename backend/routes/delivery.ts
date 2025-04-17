import { Router, Request, Response } from "express";
import { Delivery } from "../db/schema";
import { processDelivery, getInningDetails } from "../utils/delivery";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    await processDelivery(delivery);
    const inningData = await getInningDetails(delivery.inning);
    return res.status(201).json({
        delivery,
        inningDetails: inningData
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to record delivery" });
  }
});

export default router;
