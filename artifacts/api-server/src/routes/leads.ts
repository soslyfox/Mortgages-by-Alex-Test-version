import { Router } from "express";

const leadsRouter = Router();

leadsRouter.post("/leads", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required." });
  }

  const lead = {
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    service: String(service || "").trim(),
    message: String(message || "").trim(),
    submittedAt: new Date().toISOString(),
  };

  console.log("[LEAD]", JSON.stringify(lead));

  try {
    await writeToGoogleSheets(lead);
  } catch (err) {
    console.error("[LEAD] Google Sheets write failed:", err);
  }

  return res.json({ success: true });
});

async function writeToGoogleSheets(lead: {
  name: string; email: string; phone: string;
  service: string; message: string; submittedAt: string;
}) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.warn("[LEAD] GOOGLE_SHEET_ID not set — skipping Sheets write.");
    return;
  }

  // Sheets client will be wired here after Google integration is connected
  // Placeholder — populated by the Google Sheets integration step
  console.log("[LEAD] Would write to sheet:", sheetId, lead);
}

export default leadsRouter;
