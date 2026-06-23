/**
 * VALERIS — Lead-capture endpoint (Google Apps Script → Google Sheets CRM)
 * =====================================================================
 * One-time setup (client's own Google account):
 *   1. Create a new Google Sheet.
 *   2. Extensions → Apps Script. Delete the stub and paste this file.
 *   3. Deploy → New deployment → type "Web app".
 *        Execute as: Me   ·   Who has access: Anyone
 *   4. Copy the Web app URL into  assets/js/config.js → crmEndpoint.
 *   5. (optional) Set NOTIFY_EMAIL below to receive an email per lead.
 *
 * Every contact-form submission is appended as one row, including the
 * UTM / referrer / device enrichment captured by assets/js/main.js.
 */

var SHEET_NAME   = 'Leads';
var NOTIFY_EMAIL = ''; // e.g. 'agata@valeris.com.in' — leave '' to disable

var HEADERS = ['Received', 'Name', 'Company', 'Email', 'Phone', 'Interest', 'Message',
  'Language', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Referrer', 'Page URL',
  'Device', 'User Agent', 'Client Time'];

function doPost(e) {
  try {
    var d = {};
    if (e && e.postData && e.postData.contents) { d = JSON.parse(e.postData.contents); }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sh.setFrozenRows(1);
    }

    sh.appendRow([
      new Date(), d.name || '', d.company || '', d.email || '', d.phone || '',
      d.interest || '', d.message || '', d.language || '', d.utm_source || '',
      d.utm_medium || '', d.utm_campaign || '', d.referrer || '', d.page_url || '',
      d.device || '', d.user_agent || '', d.timestamp || ''
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL,
        'New website lead — ' + (d.name || 'unknown') + (d.company ? ' (' + d.company + ')' : ''),
        'Name: ' + (d.name || '') + '\nCompany: ' + (d.company || '') + '\nEmail: ' + (d.email || '') +
        '\nPhone: ' + (d.phone || '') + '\nInterest: ' + (d.interest || '') +
        '\n\nMessage:\n' + (d.message || '') + '\n\nSource: ' + (d.utm_source || 'direct') +
        ' · ' + (d.page_url || ''));
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Valeris lead endpoint is live.');
}
