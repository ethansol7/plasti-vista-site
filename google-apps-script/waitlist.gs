const SHEET_NAME = "Waitlist";

const HEADERS = [
  "timestamp",
  "name",
  "email",
  "company_or_organization",
  "role_or_title",
  "interest_type",
  "message_or_notes",
  "source_page",
  "campaign",
  "submission_id"
];

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "PlastiVista waitlist endpoint is live."
  });
}

function doPost(event) {
  try {
    const payload = parsePayload_(event);
    const sheet = getWaitlistSheet_();

    ensureHeaders_(sheet);

    const submissionId = normalize_(payload.submissionId || payload.submission_id);
    if (submissionId && isDuplicateSubmission_(sheet, submissionId)) {
      return jsonResponse_({
        ok: true,
        duplicate: true,
        message: "Submission already captured."
      });
    }

    sheet.appendRow([
      normalize_(payload.timestamp) || new Date().toISOString(),
      normalize_(payload.name || payload.fullName),
      normalize_(payload.email),
      normalize_(payload.company || payload.companyOrOrganization),
      normalize_(payload.roleTitle || payload.role || payload.title),
      normalize_(payload.interestType),
      normalize_(payload.message || payload.notes),
      normalize_(payload.sourcePage),
      normalize_(payload.campaign),
      submissionId
    ]);

    return jsonResponse_({
      ok: true,
      message: "Submission captured."
    });
  } catch (error) {
    return jsonResponse_(
      {
        ok: false,
        message: error && error.message ? error.message : "Submission failed."
      },
      500
    );
  }
}

function parsePayload_(event) {
  const raw = event && event.postData && event.postData.contents;
  if (!raw) {
    throw new Error("Missing request body.");
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("Request body must be JSON.");
  }
}

function getWaitlistSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeaders_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];
  const hasHeaders = currentHeaders.some((value) => String(value || "").trim() !== "");

  if (!hasHeaders) {
    headerRange.setValues([HEADERS]);
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function isDuplicateSubmission_(sheet, submissionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const submissionIdColumn = HEADERS.indexOf("submission_id") + 1;
  const values = sheet
    .getRange(2, submissionIdColumn, lastRow - 1, 1)
    .getValues()
    .flat();

  return values.some((value) => normalize_(value) === submissionId);
}

function normalize_(value) {
  return String(value || "").trim();
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
