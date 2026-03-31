// Google Sheets integration — Replit google-sheet connector
import { google } from "googleapis";

let connectionSettings: any;

async function getAccessToken() {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=google-sheet",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("Google Sheet not connected");
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth: oauth2Client });
}

export async function createLeadsSpreadsheet(): Promise<string> {
  const sheets = await getUncachableGoogleSheetClient();
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: "Mortgages by Alex — Leads" },
      sheets: [
        {
          properties: { title: "Leads", sheetId: 0, index: 0 },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "Submitted At" } },
                    { userEnteredValue: { stringValue: "Name" } },
                    { userEnteredValue: { stringValue: "Email" } },
                    { userEnteredValue: { stringValue: "Phone" } },
                    { userEnteredValue: { stringValue: "Service" } },
                    { userEnteredValue: { stringValue: "Message" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const id = spreadsheet.data.spreadsheetId;
  if (!id) throw new Error("Failed to get spreadsheet ID from API response");
  return id;
}

export async function appendLead(
  sheetId: string,
  lead: {
    submittedAt: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  }
) {
  const sheets = await getUncachableGoogleSheetClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Leads!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          lead.submittedAt,
          lead.name,
          lead.email,
          lead.phone,
          lead.service,
          lead.message,
        ],
      ],
    },
  });
}
