/**
 * VALERIS — Google Sheets CRM Backend
 * =====================================================================
 * Architecture: Website → Apps Script API → Google Sheets ← Next.js CRM
 *
 * This file is the single backend for both the website contact form and
 * the Valeris internal CRM. The Next.js CRM never accesses Google Sheets
 * directly — every request goes through this Apps Script API.
 *
 * One-time setup (see docs/crm-setup.md for full instructions):
 *   1. Paste this file into the Apps Script editor bound to the Google Sheet.
 *   2. Set NOTIFY_EMAIL below if you want email alerts for new leads.
 *   3. Run setupCrm() once to create all sheets, headers, and formatting.
 *      Run it again whenever the schema version changes — it is idempotent.
 *   4. IMPORTANT: Delete any existing onEdit trigger (Apps Script → Triggers).
 *      The updated_at column is now written explicitly by the API; the
 *      onEdit trigger is no longer used and conflicts with this approach.
 *   5. Run seedOwner() to create the first Owner user.
 *   6. Deploy as Web App (Execute as: Me, Who has access: Anyone).
 *   7. Paste the Web App URL into:
 *        - assets/js/config.js → crmEndpoint  (website contact form)
 *        - valeris-crm/.env → APPS_SCRIPT_URL  (CRM frontend)
 */

// ============================================================
// CONFIGURATION
// ============================================================

var NOTIFY_EMAIL = ''; // e.g. 'agata@valeris.com.in' — leave empty to disable

var SESSION_HOURS = 24;   // sliding window: each valid request extends by this many hours
var HASH_ITERATIONS = 1000; // SHA-256 iterations for password hashing
var CACHE_TTL = 300;      // seconds to cache Users and Settings reads (5 minutes)
var SCHEMA_VERSION = '1';

// ============================================================
// SHEET NAMES
// ============================================================

var SHEET = {
  LEADS:      'Leads',
  COMPANIES:  'Companies',
  CONTACTS:   'Contacts',
  PROJECTS:   'Projects',
  TASKS:      'Tasks',
  NOTES:      'Notes',
  ACTIVITIES: 'Activities',
  USERS:      'Users',
  SETTINGS:   'Settings',
  META:       '_Meta',
  DASHBOARD:  'Dashboard',
  README:     'README'
};

// ============================================================
// COLUMN MAPS
// ============================================================
// All column positions are defined here — never hardcode column
// numbers elsewhere. When a column is added: update this map,
// run setupCrm() to add the column to the sheet, and redeploy.
// New columns are always appended at the end of each sheet.

var COLS = {

  // The Leads sheet keeps the original 26-column order for backward
  // compatibility with the existing website form integration.
  // New CRM columns are appended at positions 27+.
  LEADS: {
    received:                  1,
    lead_id:                   2,
    status:                    3,
    priority:                  4,
    owner:                     5,
    next_action:               6,
    next_action_date:          7,
    updated_at:                8,  // was "Last Updated" in prior versions
    first_name:                9,
    last_name:                10,
    full_name:                11,
    company_name:             12,
    email:                    13,
    phone:                    14,
    interest:                 15,
    message:                  16,
    language:                 17,
    utm_source:               18,
    utm_medium:               19,
    utm_campaign:             20,
    referrer:                 21,
    page_url:                 22,
    device:                   23,
    user_agent:               24,
    client_timestamp:         25,
    notes:                    26,
    // CRM columns appended below
    created_by:               27,
    updated_by:               28,
    deleted_at:               29,
    trade_direction:          30,
    company_id:               31,
    contact_id:               32,
    converted_to_project_id:  33,
    converted_at:             34,
    converted_by:             35
  },

  USERS: {
    user_id:            1,
    email:              2,
    full_name:          3,
    role:               4,
    status:             5,
    password_hash:      6,
    password_salt:      7,
    session_token:      8,
    session_expires_at: 9,
    last_login_at:     10,
    created_at:        11,
    created_by:        12
  },

  COMPANIES: {
    company_id:         1,
    name:               2,
    type:               3,
    country:            4,
    city:               5,
    industry:           6,
    trade_direction:    7,
    website:            8,
    linkedin:           9,
    email:             10,
    phone:             11,
    status:            12,
    owner_user_id:     13,
    primary_contact_id: 14,
    created_at:        15,
    created_by:        16,
    updated_at:        17,
    updated_by:        18,
    deleted_at:        19,
    notes:             20
  },

  CONTACTS: {
    contact_id:       1,
    company_id:       2,
    first_name:       3,
    last_name:        4,
    full_name:        5,
    title:            6,
    email:            7,
    phone:            8,
    linkedin:         9,
    language:        10,
    is_primary:      11,
    status:          12,
    owner_user_id:   13,
    created_at:      14,
    created_by:      15,
    updated_at:      16,
    updated_by:      17,
    deleted_at:      18
  },

  PROJECTS: {
    project_id:         1,
    lead_id:            2,
    company_id:         3,
    contact_id:         4,
    name:               5,
    service_line:       6,
    trade_direction:    7,
    status:             8,
    phase:              9,
    priority:          10,
    owner_user_id:     11,
    operations_user_id: 12,
    start_date:        13,
    target_end_date:   14,
    actual_end_date:   15,
    description:       16,
    created_at:        17,
    created_by:        18,
    updated_at:        19,
    updated_by:        20,
    deleted_at:        21
  },

  TASKS: {
    task_id:        1,
    entity_type:    2,
    entity_id:      3,
    title:          4,
    description:    5,
    status:         6,
    priority:       7,
    assigned_to:    8,
    due_date:       9,
    completed_at:  10,
    completed_by:  11,
    created_at:    12,
    created_by:    13,
    updated_at:    14,
    updated_by:    15,
    deleted_at:    16
  },

  NOTES: {
    note_id:        1,
    entity_type:    2,
    entity_id:      3,
    content:        4,
    author_user_id: 5,
    created_at:     6,
    updated_at:     7,
    deleted_at:     8
  },

  ACTIVITIES: {
    activity_id:      1,
    entity_type:      2,
    entity_id:        3,
    activity_type:    4,
    summary:          5,
    details:          6,
    performed_by:     7,
    performed_at:     8,
    created_at:       9
  },

  SETTINGS: {
    category:     1,
    key:          2,
    label:        3,
    color:        4,
    sort_order:   5,
    is_active:    6,
    description:  7
  },

  META: {
    key:        1,
    value:      2,
    updated_at: 3
  }
};

// ============================================================
// ERROR CODES
// ============================================================

var ERR = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN:     'FORBIDDEN',
  NOT_FOUND:     'NOT_FOUND',
  VALIDATION:    'VALIDATION_ERROR',
  INTERNAL:      'INTERNAL_ERROR'
};

// ============================================================
// LOOKUP VALUES (for dropdowns and validation)
// ============================================================

var LEAD_STATUSES  = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost', 'Spam'];
var PRIORITIES     = ['High', 'Medium', 'Low'];
var SERVICES = [
  'Supplier Verification',
  'India Market Entry Consulting',
  'Representation in India',
  'Operational Support',
  'Poland Market Entry (Indian company)',
  'Pharma — Europe Market Entry',
  'Other / Not sure yet'
];
var ROLES          = ['Owner', 'Administrator', 'Sales', 'Operations'];
var USER_STATUSES  = ['Active', 'Inactive'];

// ============================================================
// ENTRY POINTS
// ============================================================

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  // Health check — the only unauthenticated GET
  if (!action || action === 'ping') {
    return json_({ ok: true, version: SCHEMA_VERSION });
  }

  try {
    var auth = extractGetAuth_(e);
    var p    = e.parameter || {};

    switch (action) {
      // M1+ actions will be added here as each milestone ships
      default:
        return json_({ ok: false, error: 'Unknown action: ' + action, code: ERR.VALIDATION });
    }
  } catch (err) {
    return handleError_(err);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var body   = parsePayload_(e);
    var action = body.action || '';

    // No action field = website contact form submission (backward compatible)
    if (!action) {
      return handleWebsiteFormSubmission_(body);
    }

    // Unauthenticated actions
    if (action === 'login') {
      return json_(handleLogin_(body.data || {}));
    }

    // All other actions require a valid session
    var auth = body.auth || {};
    var data = body.data || {};

    switch (action) {
      // M1+ actions will be added here as each milestone ships
      default:
        return json_({ ok: false, error: 'Unknown action: ' + action, code: ERR.VALIDATION });
    }
  } catch (err) {
    return handleError_(err);
  } finally {
    lock.releaseLock();
  }
}

// ============================================================
// AUTH ACTION HANDLER
// ============================================================

function handleLogin_(data) {
  var email    = sanitize_(data.email);
  var password = String(data.password || '');

  if (!email || !password) {
    return { ok: false, error: 'Email and password are required', code: ERR.VALIDATION };
  }

  var user = getUserByEmail_(email);
  if (!user || user.status !== 'Active') {
    return { ok: false, error: 'Incorrect email or password', code: ERR.AUTH_REQUIRED };
  }

  if (!verifyPassword_(password, user.password_salt, user.password_hash)) {
    return { ok: false, error: 'Incorrect email or password', code: ERR.AUTH_REQUIRED };
  }

  var token     = Utilities.getUuid();
  var expiresAt = new Date(new Date().getTime() + SESSION_HOURS * 3600 * 1000).toISOString();
  var now       = new Date().toISOString();

  updateUserSession_(user.user_id, token, expiresAt, now);

  return {
    ok: true,
    data: {
      token:     token,
      userId:    user.user_id,
      email:     user.email,
      name:      user.full_name,
      role:      user.role,
      expiresAt: expiresAt
    }
  };
}

// ============================================================
// WEBSITE CONTACT FORM HANDLER (backward compatible)
// ============================================================

function handleWebsiteFormSubmission_(d) {
  // Honeypot: silent discard
  if (d.website) {
    return json_({ ok: true, ignored: true });
  }

  var email     = sanitize_(d.email);
  var firstName = sanitize_(d.first_name);
  var lastName  = sanitize_(d.last_name);
  var fullName  = sanitize_(d.name) || (firstName + ' ' + lastName).trim();
  var message   = sanitize_(d.message);

  if (!firstName || !lastName || !email || !message) {
    return json_({ ok: false, error: 'Missing required fields', code: ERR.VALIDATION });
  }

  var sh  = getOrCreateSheet_(SHEET.LEADS);
  var now = new Date();
  var leadId = makeId_('VAL', now);

  // Build the row using COLS positions so column order is always explicit
  var row = buildRow_(COLS.LEADS, {
    received:          now,
    lead_id:           leadId,
    status:            'New',
    priority:          inferPriority_(d.interest),
    owner:             '',
    next_action:       'Reply within 1 business day',
    next_action_date:  '',
    updated_at:        now,
    first_name:        firstName,
    last_name:         lastName,
    full_name:         fullName,
    company_name:      sanitize_(d.company),
    email:             email,
    phone:             sanitize_(d.phone),
    interest:          normalizeInterest_(d.interest),
    message:           message,
    language:          sanitize_(d.language),
    utm_source:        sanitize_(d.utm_source),
    utm_medium:        sanitize_(d.utm_medium),
    utm_campaign:      sanitize_(d.utm_campaign),
    referrer:          sanitize_(d.referrer),
    page_url:          sanitize_(d.page_url),
    device:            sanitize_(d.device),
    user_agent:        sanitize_(d.user_agent),
    client_timestamp:  sanitize_(d.timestamp),
    notes:             '',
    created_by:        'website',
    updated_by:        'website'
  });

  sh.appendRow(row);

  var rowNumber = sh.getLastRow();
  sh.getRange(rowNumber, 1, 1, row.length).setVerticalAlignment('top');
  // Wrap the message and notes columns
  sh.getRange(rowNumber, COLS.LEADS.message).setWrap(true);
  sh.getRange(rowNumber, COLS.LEADS.notes).setWrap(true);

  logActivity_('Lead', leadId, 'lead_received',
    'Lead received from ' + sanitize_(d.device) + ' via website',
    sanitize_(d.page_url),
    'website');

  notify_(leadId, fullName, sanitize_(d.company), email,
    sanitize_(d.phone), normalizeInterest_(d.interest),
    inferPriority_(d.interest), message,
    sanitize_(d.utm_source), sanitize_(d.utm_medium), sanitize_(d.utm_campaign),
    sanitize_(d.page_url), sanitize_(d.device));

  return json_({ ok: true, lead_id: leadId });
}

// ============================================================
// AUTH HELPERS
// ============================================================

function requireAuth_(auth) {
  if (!auth || !auth.userId || !auth.token) {
    throw new Error(ERR.AUTH_REQUIRED);
  }
  var user = getUserById_(auth.userId);
  if (!user) throw new Error(ERR.AUTH_REQUIRED);
  if (user.session_token !== auth.token) throw new Error(ERR.AUTH_REQUIRED);
  if (!user.session_expires_at) throw new Error(ERR.AUTH_REQUIRED);

  var expiry = new Date(user.session_expires_at);
  if (isNaN(expiry.getTime()) || expiry < new Date()) {
    throw new Error(ERR.AUTH_REQUIRED);
  }

  // Slide the session window on every authenticated request
  var newExpiry = new Date(new Date().getTime() + SESSION_HOURS * 3600 * 1000).toISOString();
  updateUserSession_(user.user_id, auth.token, newExpiry, null);

  return user;
}

function requireRole_(auth, allowedRoles) {
  var user = requireAuth_(auth);
  if (allowedRoles && allowedRoles.indexOf(user.role) === -1) {
    throw new Error(ERR.FORBIDDEN);
  }
  return user;
}

// ============================================================
// PASSWORD HASHING
// ============================================================

function hashPassword_(plainPassword, salt) {
  var input = salt + ':' + plainPassword;
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input,
    Utilities.Charset.UTF_8
  );
  // Key-stretching: HASH_ITERATIONS rounds of SHA-256
  for (var i = 1; i < HASH_ITERATIONS; i++) {
    bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes);
  }
  return bytes.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function verifyPassword_(plainPassword, salt, storedHash) {
  return hashPassword_(plainPassword, salt) === storedHash;
}

// ============================================================
// USER HELPERS
// ============================================================

function getAllUsers_() {
  var cached = getCached_('users');
  if (cached) return cached;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.USERS);
  if (!sh || sh.getLastRow() < 2) return [];

  var numCols = Object.keys(COLS.USERS).length;
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();
  var users = data
    .map(function(row) { return rowToObject_(COLS.USERS, row); })
    .filter(function(u) { return u.user_id !== ''; });

  setCached_('users', users);
  return users;
}

function getUserByEmail_(email) {
  var lower = String(email).toLowerCase().trim();
  var match = null;
  getAllUsers_().forEach(function(u) {
    if (String(u.email).toLowerCase().trim() === lower) match = u;
  });
  return match;
}

function getUserById_(userId) {
  var match = null;
  getAllUsers_().forEach(function(u) {
    if (u.user_id === userId) match = u;
  });
  return match;
}

function updateUserSession_(userId, token, expiresAt, lastLoginAt) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.USERS);
  if (!sh) return;

  var numCols = Object.keys(COLS.USERS).length;
  var data = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues()
    : [];

  for (var i = 0; i < data.length; i++) {
    if (data[i][COLS.USERS.user_id - 1] === userId) {
      var rowNum = i + 2;
      sh.getRange(rowNum, COLS.USERS.session_token).setValue(token);
      sh.getRange(rowNum, COLS.USERS.session_expires_at).setValue(expiresAt);
      if (lastLoginAt) {
        sh.getRange(rowNum, COLS.USERS.last_login_at).setValue(lastLoginAt);
      }
      invalidateCache_('users');
      return;
    }
  }
}

// ============================================================
// ACTIVITY LOGGING (internal — not a public API action)
// ============================================================

function logActivity_(entityType, entityId, activityType, summary, details, performedBy) {
  try {
    var ss  = SpreadsheetApp.getActiveSpreadsheet();
    var sh  = ss.getSheetByName(SHEET.ACTIVITIES);
    if (!sh) return;

    var now = new Date().toISOString();
    var row = buildRow_(COLS.ACTIVITIES, {
      activity_id:   makeId_('ACT', new Date()),
      entity_type:   entityType || '',
      entity_id:     entityId || '',
      activity_type: activityType || '',
      summary:       sanitize_(summary),
      details:       sanitize_(details),
      performed_by:  performedBy || '',
      performed_at:  now,
      created_at:    now
    });
    sh.appendRow(row);
  } catch (e) {
    // Activity logging failures must never propagate to the caller
    console.error('[Valeris] logActivity_ failed:', String(e));
  }
}

// ============================================================
// SHEET HELPERS
// ============================================================

function getOrCreateSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function buildRow_(colMap, data) {
  var maxCol = 0;
  var keys = Object.keys(colMap);
  for (var i = 0; i < keys.length; i++) {
    if (colMap[keys[i]] > maxCol) maxCol = colMap[keys[i]];
  }
  var row = new Array(maxCol).fill('');
  Object.keys(data).forEach(function(key) {
    if (colMap[key] !== undefined && data[key] !== undefined) {
      row[colMap[key] - 1] = data[key];
    }
  });
  return row;
}

function rowToObject_(colMap, rowArray) {
  var obj = {};
  Object.keys(colMap).forEach(function(key) {
    var idx = colMap[key] - 1;
    obj[key] = (idx < rowArray.length) ? rowArray[idx] : '';
  });
  return obj;
}

// ============================================================
// CACHE HELPERS
// ============================================================

function getCached_(key) {
  var raw = CacheService.getScriptCache().get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function setCached_(key, data) {
  try {
    CacheService.getScriptCache().put(key, JSON.stringify(data), CACHE_TTL);
  } catch (e) { /* cache size exceeded — skip gracefully */ }
}

function invalidateCache_(key) {
  CacheService.getScriptCache().remove(key);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Generate a stable, collision-resistant entity ID.
 * Format: PREFIX-YYYYMMDDHHmmssSSS-XXXXXX
 * (millisecond timestamp in script timezone + 6-char random hex suffix)
 */
function makeId_(prefix, date) {
  date = date || new Date();
  var ts = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMddHHmmssSSS');
  var suffix = Utilities.getUuid().replace(/-/g, '').slice(0, 6);
  return prefix + '-' + ts + '-' + suffix;
}

/**
 * Sanitize a user-supplied value: trim whitespace and prefix formula-injection
 * characters (= + - @) with an apostrophe so Sheets treats them as plain text.
 */
function sanitize_(value) {
  var s = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  if (s && ['=', '+', '-', '@'].indexOf(s[0]) !== -1) s = "'" + s;
  return s;
}

function inferPriority_(interest) {
  var v = normalizeInterest_(interest).toLowerCase();
  if (v.indexOf('supplier verification') !== -1) return 'High';
  if (v.indexOf('pharma') !== -1) return 'High';
  return 'Medium';
}

function normalizeInterest_(interest) {
  var v = sanitize_(interest);
  return v || 'Other / Not sure yet';
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try { return JSON.parse(e.postData.contents); } catch (err) { return {}; }
}

function extractGetAuth_(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  return { userId: p.userId || '', token: p.token || '' };
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleError_(err) {
  var msg = String(err.message || err);
  var knownCodes = [ERR.AUTH_REQUIRED, ERR.FORBIDDEN, ERR.NOT_FOUND, ERR.VALIDATION, ERR.INTERNAL];

  if (knownCodes.indexOf(msg) !== -1) {
    var display = {};
    display[ERR.AUTH_REQUIRED] = 'Authentication required';
    display[ERR.FORBIDDEN]     = 'You do not have permission to perform this action';
    display[ERR.NOT_FOUND]     = 'Resource not found';
    display[ERR.VALIDATION]    = 'Invalid request data';
    display[ERR.INTERNAL]      = 'An unexpected error occurred';
    return json_({ ok: false, error: display[msg] || msg, code: msg });
  }

  console.error('[Valeris CRM] Unhandled error:', msg);
  return json_({ ok: false, error: 'An unexpected error occurred', code: ERR.INTERNAL });
}

function getSchemaVersion_() {
  var cached = getCached_('schema_version');
  if (cached) return cached;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.META);
  if (!sh || sh.getLastRow() < 2) return SCHEMA_VERSION;

  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][COLS.META.key - 1] === 'schema_version') {
      var v = String(data[i][COLS.META.value - 1]);
      setCached_('schema_version', v);
      return v;
    }
  }
  return SCHEMA_VERSION;
}

// ============================================================
// NOTIFICATION
// ============================================================

function notify_(leadId, fullName, company, email, phone, interest, priority,
                 message, utmSource, utmMedium, utmCampaign, pageUrl, device) {
  if (!NOTIFY_EMAIL) return;
  var subject = 'New Valeris website lead — ' + fullName;
  var body =
    'Lead ID: ' + leadId + '\n' +
    'Name: ' + fullName + '\n' +
    'Company: ' + company + '\n' +
    'Email: ' + email + '\n' +
    'Phone: ' + phone + '\n' +
    'Interest: ' + interest + '\n' +
    'Priority: ' + priority + '\n\n' +
    'Message:\n' + message + '\n\n' +
    'Source: ' + (utmSource || 'direct') + ' / ' + (utmMedium || '-') + ' / ' + (utmCampaign || '-') + '\n' +
    'Page: ' + pageUrl + '\n' +
    'Device: ' + device;
  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

// ============================================================
// SETUP — run once, safe to re-run
// ============================================================

/**
 * Create or update all CRM sheets.
 * Safe to run on an existing sheet: adds missing columns, never removes data.
 */
function setupCrm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  setupLeadsSheet_(ss);
  setupUsersSheet_(ss);
  setupSheet_(ss, SHEET.COMPANIES,  buildHeadersFromCols_(COLS.COMPANIES));
  setupSheet_(ss, SHEET.CONTACTS,   buildHeadersFromCols_(COLS.CONTACTS));
  setupSheet_(ss, SHEET.PROJECTS,   buildHeadersFromCols_(COLS.PROJECTS));
  setupSheet_(ss, SHEET.TASKS,      buildHeadersFromCols_(COLS.TASKS));
  setupSheet_(ss, SHEET.NOTES,      buildHeadersFromCols_(COLS.NOTES));
  setupSheet_(ss, SHEET.ACTIVITIES, buildHeadersFromCols_(COLS.ACTIVITIES));
  setupSheet_(ss, SHEET.SETTINGS,   buildHeadersFromCols_(COLS.SETTINGS));
  setupMetaSheet_(ss);
  createDashboard_(ss);
  createReadme_(ss);

  return 'Valeris CRM setup complete (schema v' + SCHEMA_VERSION + ').';
}

/**
 * Derive header names from a COLS map in column-position order.
 * Converts underscores to Title Case for display.
 */
function buildHeadersFromCols_(colMap) {
  var ordered = [];
  var maxCol = 0;
  Object.keys(colMap).forEach(function(key) {
    if (colMap[key] > maxCol) maxCol = colMap[key];
  });
  ordered = new Array(maxCol).fill('');
  Object.keys(colMap).forEach(function(key) {
    ordered[colMap[key] - 1] = key
      .split('_')
      .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join(' ');
  });
  return ordered;
}

/**
 * Create a sheet with the given headers if it does not exist.
 * If it exists, append any missing headers at the end of row 1.
 */
function setupSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  ensureHeaders_(sh, headers);
  styleHeaderRow_(sh, headers.length);
  return sh;
}

function ensureHeaders_(sh, expectedHeaders) {
  sh.setFrozenRows(1);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    return;
  }

  var lastCol = Math.max(sh.getLastColumn(), 1);
  var existing = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);

  // Add missing headers at the end
  var nextCol = lastCol;
  for (var i = 0; i < expectedHeaders.length; i++) {
    if (existing.indexOf(expectedHeaders[i]) === -1) {
      // Header not found — check if this position is still empty
      if (i < existing.length && existing[i] === '') {
        sh.getRange(1, i + 1).setValue(expectedHeaders[i]);
      } else {
        nextCol++;
        sh.getRange(1, nextCol).setValue(expectedHeaders[i]);
      }
    } else {
      // Header exists but may be in wrong column — update in place if position differs
      var actualIdx = existing.indexOf(expectedHeaders[i]);
      if (actualIdx !== i && i < existing.length) {
        // Leave it where it is (don't rearrange existing data)
      }
    }
  }
}

function styleHeaderRow_(sh, numCols) {
  sh.getRange(1, 1, 1, numCols)
    .setFontWeight('bold')
    .setFontColor('#F1E4D1')
    .setBackground('#071917')
    .setVerticalAlignment('middle')
    .setWrap(false);
}

// ============================================================
// LEADS SHEET SETUP (more detailed than other sheets)
// ============================================================

function setupLeadsSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.LEADS);
  // Override display names that differ from the key-derived form
  headers[COLS.LEADS.received - 1]          = 'Received';
  headers[COLS.LEADS.lead_id - 1]           = 'Lead ID';
  headers[COLS.LEADS.next_action - 1]       = 'Next Action';
  headers[COLS.LEADS.next_action_date - 1]  = 'Next Action Date';
  headers[COLS.LEADS.updated_at - 1]        = 'Updated At';
  headers[COLS.LEADS.company_name - 1]      = 'Company';
  headers[COLS.LEADS.client_timestamp - 1]  = 'Client Time';
  headers[COLS.LEADS.utm_source - 1]        = 'UTM Source';
  headers[COLS.LEADS.utm_medium - 1]        = 'UTM Medium';
  headers[COLS.LEADS.utm_campaign - 1]      = 'UTM Campaign';

  var sh = ss.getSheetByName(SHEET.LEADS) || ss.insertSheet(SHEET.LEADS);
  ensureHeaders_(sh, headers);
  styleHeaderRow_(sh, headers.length);

  sh.setFrozenRows(1);
  sh.setFrozenColumns(3);
  sh.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  sh.getRange(1, COLS.LEADS.next_action_date, 1000)
    .setNumberFormat('yyyy-mm-dd');
  sh.getRange(1, COLS.LEADS.updated_at, 1000)
    .setNumberFormat('yyyy-mm-dd hh:mm');

  var colWidths = {};
  colWidths[COLS.LEADS.received]         = 140;
  colWidths[COLS.LEADS.lead_id]          = 220;
  colWidths[COLS.LEADS.status]           = 110;
  colWidths[COLS.LEADS.priority]         = 90;
  colWidths[COLS.LEADS.owner]            = 120;
  colWidths[COLS.LEADS.next_action]      = 190;
  colWidths[COLS.LEADS.next_action_date] = 120;
  colWidths[COLS.LEADS.updated_at]       = 140;
  colWidths[COLS.LEADS.full_name]        = 160;
  colWidths[COLS.LEADS.company_name]     = 170;
  colWidths[COLS.LEADS.email]            = 210;
  colWidths[COLS.LEADS.interest]         = 230;
  colWidths[COLS.LEADS.message]          = 360;
  colWidths[COLS.LEADS.page_url]         = 260;
  colWidths[COLS.LEADS.user_agent]       = 300;
  colWidths[COLS.LEADS.notes]            = 300;

  Object.keys(colWidths).forEach(function(col) {
    sh.setColumnWidth(Number(col), colWidths[col]);
  });

  applyLeadsValidation_(sh);
  applyLeadsConditionalFormatting_(sh);
  return sh;
}

function applyLeadsValidation_(sh) {
  var lastRow = Math.max(sh.getMaxRows(), 1000);
  sh.getRange(2, COLS.LEADS.status,   lastRow - 1, 1).setDataValidation(listRule_(LEAD_STATUSES));
  sh.getRange(2, COLS.LEADS.priority, lastRow - 1, 1).setDataValidation(listRule_(PRIORITIES));
  sh.getRange(2, COLS.LEADS.interest, lastRow - 1, 1).setDataValidation(listRule_(SERVICES));
}

function applyLeadsConditionalFormatting_(sh) {
  var lastRow     = Math.max(sh.getMaxRows(), 1000);
  var statusRange = sh.getRange(2, COLS.LEADS.status,   lastRow - 1, 1);
  var priRange    = sh.getRange(2, COLS.LEADS.priority, lastRow - 1, 1);
  var rules = [
    formatRule_(statusRange, 'New',       '#FFF2CC'),
    formatRule_(statusRange, 'Contacted', '#D9EAF7'),
    formatRule_(statusRange, 'Qualified', '#D9EAD3'),
    formatRule_(statusRange, 'Proposal',  '#EADCF8'),
    formatRule_(statusRange, 'Won',       '#B6D7A8'),
    formatRule_(statusRange, 'Lost',      '#F4CCCC'),
    formatRule_(statusRange, 'Spam',      '#D9D9D9'),
    formatRule_(priRange,    'High',      '#F4CCCC'),
    formatRule_(priRange,    'Medium',    '#FFF2CC'),
    formatRule_(priRange,    'Low',       '#D9EAD3')
  ];
  sh.setConditionalFormatRules(rules);
}

// ============================================================
// USERS SHEET SETUP
// ============================================================

function setupUsersSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.USERS);
  headers[COLS.USERS.user_id - 1]            = 'User ID';
  headers[COLS.USERS.full_name - 1]          = 'Full Name';
  headers[COLS.USERS.password_hash - 1]      = 'Password Hash';
  headers[COLS.USERS.password_salt - 1]      = 'Password Salt';
  headers[COLS.USERS.session_token - 1]      = 'Session Token';
  headers[COLS.USERS.session_expires_at - 1] = 'Session Expires At';
  headers[COLS.USERS.last_login_at - 1]      = 'Last Login At';
  headers[COLS.USERS.created_at - 1]         = 'Created At';
  headers[COLS.USERS.created_by - 1]         = 'Created By';

  var sh = ss.getSheetByName(SHEET.USERS) || ss.insertSheet(SHEET.USERS);
  ensureHeaders_(sh, headers);
  styleHeaderRow_(sh, headers.length);
  sh.setFrozenRows(1);

  // Hide sensitive columns from casual view
  var sensitiveStart = COLS.USERS.password_hash;
  var sensitiveEnd   = COLS.USERS.session_expires_at;
  sh.hideColumns(sensitiveStart, sensitiveEnd - sensitiveStart + 1);

  var lastRow = Math.max(sh.getMaxRows(), 100);
  sh.getRange(2, COLS.USERS.role,   lastRow - 1, 1).setDataValidation(listRule_(ROLES));
  sh.getRange(2, COLS.USERS.status, lastRow - 1, 1).setDataValidation(listRule_(USER_STATUSES));

  sh.setColumnWidth(COLS.USERS.user_id,   220);
  sh.setColumnWidth(COLS.USERS.email,     220);
  sh.setColumnWidth(COLS.USERS.full_name, 180);
  sh.setColumnWidth(COLS.USERS.role,      130);
  sh.setColumnWidth(COLS.USERS.status,    100);
  return sh;
}

// ============================================================
// META SHEET
// ============================================================

function setupMetaSheet_(ss) {
  var sh = ss.getSheetByName(SHEET.META) || ss.insertSheet(SHEET.META);
  sh.clear();

  var now = new Date().toISOString();
  var rows = [
    ['Key', 'Value', 'Updated At'],
    ['schema_version', SCHEMA_VERSION, now],
    ['deployed_at', now, now],
    ['deployed_by', Session.getEffectiveUser().getEmail() || 'unknown', now]
  ];
  sh.getRange(1, 1, rows.length, 3).setValues(rows);
  styleHeaderRow_(sh, 3);
  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 240);
  sh.setColumnWidth(3, 200);
  invalidateCache_('schema_version');
  return sh;
}

// ============================================================
// DASHBOARD AND README
// ============================================================

function createDashboard_(ss) {
  var sh = ss.getSheetByName(SHEET.DASHBOARD) || ss.insertSheet(SHEET.DASHBOARD);
  sh.clear();

  sh.getRange(1, 1, 1, 4).merge().setValue('Valeris CRM Dashboard');
  sh.getRange(1, 1).setFontWeight('bold').setFontSize(16)
    .setFontColor('#F1E4D1').setBackground('#071917');

  sh.getRange(3, 1, 4, 2).setValues([
    ['Total leads',    '=COUNTA(Leads!B2:B)'],
    ['Open leads',     '=COUNTIF(Leads!C2:C,"New")+COUNTIF(Leads!C2:C,"Contacted")+COUNTIF(Leads!C2:C,"Qualified")+COUNTIF(Leads!C2:C,"Proposal")'],
    ['Won',            '=COUNTIF(Leads!C2:C,"Won")'],
    ['High priority',  '=COUNTIF(Leads!D2:D,"High")']
  ]);

  sh.getRange(8, 1, LEAD_STATUSES.length + 1, 2).setValues(
    [['Status', 'Count']].concat(LEAD_STATUSES.map(function(s) {
      return [s, '=COUNTIF(Leads!C2:C,"' + s + '")'];
    }))
  );

  sh.getRange(8, 4, SERVICES.length + 1, 2).setValues(
    [['Interest', 'Count']].concat(SERVICES.map(function(s) {
      return [s, '=COUNTIF(Leads!O2:O,"' + s + '")'];
    }))
  );

  sh.getRange('A3:A6').setFontWeight('bold');
  sh.getRange('A8:B8').setFontWeight('bold').setFontColor('#F1E4D1').setBackground('#071917');
  sh.getRange('D8:E8').setFontWeight('bold').setFontColor('#F1E4D1').setBackground('#071917');
  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 100);
  sh.setColumnWidth(4, 280);
  sh.setColumnWidth(5, 100);
}

function createReadme_(ss) {
  var sh = ss.getSheetByName(SHEET.README) || ss.insertSheet(SHEET.README);
  sh.clear();

  sh.getRange(1, 1, 15, 2).setValues([
    ['Valeris CRM', 'Internal CRM — Google Sheets + Apps Script + Next.js'],
    ['Architecture', 'Website → Apps Script API → Google Sheets ← Next.js CRM'],
    ['Schema version', SCHEMA_VERSION],
    ['Lead source', 'Website contact form via the Apps Script endpoint'],
    ['Lead statuses', LEAD_STATUSES.join(', ')],
    ['Priorities', PRIORITIES.join(', ')],
    ['Roles', ROLES.join(', ')],
    ['Required form fields', 'First name, last name, email, message'],
    ['Captured automatically', 'UTM source/medium/campaign, referrer, page URL, language, device, user agent'],
    ['Soft deletes', 'Leads/Companies/Contacts/Projects/Tasks/Notes — deleted_at set, row kept'],
    ['Activity log', 'Activities sheet — immutable, never deleted'],
    ['Session expiry', SESSION_HOURS + ' hours sliding window'],
    ['Password hashing', 'SHA-256 + UUID salt + ' + HASH_ITERATIONS + ' iterations'],
    ['Column positions', 'Defined in COLS maps in Code.gs — never hardcoded elsewhere'],
    ['Setup', 'Run setupCrm() to initialise or migrate. See docs/crm-setup.md.']
  ]);

  sh.getRange('A1:B1').setFontWeight('bold').setFontColor('#F1E4D1').setBackground('#071917');
  sh.getRange('A:B').setWrap(true).setVerticalAlignment('top');
  sh.setColumnWidth(1, 200);
  sh.setColumnWidth(2, 600);
}

// ============================================================
// SEED HELPERS (run from Apps Script editor only, not via HTTP)
// ============================================================

/**
 * Create the first Owner user.
 * Run from the Apps Script editor once — not callable via HTTP.
 *
 * Usage: seedOwner('agata@valeris.com.in', 'your-password', 'Agata Mielczarek-Korzeniowska')
 */
function seedOwner(email, plainPassword, fullName) {
  return seedUser_(email, plainPassword, fullName, 'Owner');
}

/**
 * Add a team member. Run from the Apps Script editor.
 * Usage: seedUser('user@example.com', 'password', 'Full Name', 'Sales')
 */
function seedUser(email, plainPassword, fullName, role) {
  return seedUser_(email, plainPassword, fullName, role || 'Sales');
}

function seedUser_(email, plainPassword, fullName, role) {
  if (!email || !plainPassword || !fullName) {
    throw new Error('email, plainPassword, and fullName are all required');
  }
  if (ROLES.indexOf(role) === -1) {
    throw new Error('role must be one of: ' + ROLES.join(', '));
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.USERS);
  if (!sh) {
    setupCrm();
    sh = ss.getSheetByName(SHEET.USERS);
  }

  // Check for duplicate email
  var existing = getAllUsers_();
  for (var i = 0; i < existing.length; i++) {
    if (String(existing[i].email).toLowerCase() === email.toLowerCase()) {
      throw new Error('A user with this email already exists: ' + email);
    }
  }

  var now    = new Date();
  var salt   = Utilities.getUuid();
  var hash   = hashPassword_(plainPassword, salt);
  var userId = makeId_('USR', now);

  var row = buildRow_(COLS.USERS, {
    user_id:    userId,
    email:      email.toLowerCase().trim(),
    full_name:  fullName,
    role:       role,
    status:     'Active',
    password_hash: hash,
    password_salt: salt,
    created_at: now.toISOString(),
    created_by: 'bootstrap'
  });

  sh.appendRow(row);
  invalidateCache_('users');
  return 'User created: ' + userId + ' (' + email + ') — Role: ' + role;
}

// ============================================================
// DROPDOWN AND FORMATTING HELPERS
// ============================================================

function formatRule_(range, text, color) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(text)
    .setBackground(color)
    .setRanges([range])
    .build();
}

function listRule_(values) {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(true)
    .build();
}
