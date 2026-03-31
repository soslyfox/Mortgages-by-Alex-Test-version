import { Router } from "express";
import { appendLead, createLeadsSpreadsheet } from "../lib/googleSheets";

const leadsRouter = Router();

// Cached sheet ID — resolved once per server process
let resolvedSheetId: string | null = null;

async function getSheetId(): Promise<string | null> {
  if (resolvedSheetId) return resolvedSheetId;
  const fromEnv = process.env.GOOGLE_SHEET_ID;
  if (fromEnv) {
    resolvedSheetId = fromEnv;
    return resolvedSheetId;
  }

  // Auto-create a sheet on first lead if no ID is configured
  try {
    console.log("[LEAD] No GOOGLE_SHEET_ID set — creating a new spreadsheet...");
    const id = await createLeadsSpreadsheet();
    console.log(`[LEAD] Created spreadsheet: https://docs.google.com/spreadsheets/d/${id}`);
    console.log(`[LEAD] Set GOOGLE_SHEET_ID=${id} to persist this.`);
    resolvedSheetId = id;
    return id;
  } catch (err) {
    console.error("[LEAD] Could not create spreadsheet:", err);
    return null;
  }
}

leadsRouter.post("/leads", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required." });
  }

  const lead = {
    submittedAt: new Date().toISOString(),
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    service: String(service || "").trim(),
    message: String(message || "").trim(),
  };

  console.log("[LEAD]", JSON.stringify(lead));

  const sheetId = await getSheetId();
  if (sheetId) {
    try {
      await appendLead(sheetId, lead);
      console.log("[LEAD] Appended to Google Sheet:", sheetId);
    } catch (err) {
      console.error("[LEAD] Google Sheets append failed:", err);
    }
  }

  return res.json({ success: true });
});

export default leadsRouter;
