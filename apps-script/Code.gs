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
var SCHEMA_VERSION = '2';

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
var ROLES             = ['Owner', 'Administrator', 'Sales', 'Operations'];
var USER_STATUSES     = ['Active', 'Inactive'];
var PROJECT_STATUSES  = ['Active', 'On Hold', 'Completed', 'Cancelled'];
var PROJECT_PHASES    = ['Discovery', 'Proposal', 'Execution', 'Delivery', 'Closed'];
var TASK_STATUSES     = ['Open', 'In Progress', 'Done', 'Cancelled'];
var COMPANY_TYPES     = ['Manufacturer', 'Distributor', 'Trading Company', 'Service Provider', 'Other'];
var COMPANY_STATUSES  = ['Active', 'Inactive', 'Prospect'];
var CONTACT_STATUSES  = ['Active', 'Inactive'];
var LANGUAGES         = ['English', 'Polish', 'Hindi', 'Other'];
var TRADE_DIRECTIONS  = ['India → Poland', 'Poland → India'];

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

    switch (action) {
      case 'getLeads':           return json_(handleGetLeads_(auth, e.parameter || {}));
      case 'getLead':            return json_(handleGetLead_(auth, e.parameter || {}));
      case 'getTimeline':        return json_(handleGetTimeline_(auth, e.parameter || {}));
      case 'getCompanies':       return json_(handleGetCompanies_(auth, e.parameter || {}));
      case 'getCompany':         return json_(handleGetCompany_(auth, e.parameter || {}));
      case 'getContacts':        return json_(handleGetContacts_(auth, e.parameter || {}));
      case 'getContact':         return json_(handleGetContact_(auth, e.parameter || {}));
      case 'getProjects':        return json_(handleGetProjects_(auth, e.parameter || {}));
      case 'getProject':         return json_(handleGetProject_(auth, e.parameter || {}));
      case 'getTasks':           return json_(handleGetTasks_(auth, e.parameter || {}));
      case 'getTask':            return json_(handleGetTask_(auth, e.parameter || {}));
      case 'getUsers':           return json_(handleGetUsers_(auth, e.parameter || {}));
      case 'getDashboardStats':  return json_(handleGetDashboardStats_(auth, e.parameter || {}));
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
      case 'updateLead':      return json_(handleUpdateLead_(auth, data));
      case 'deleteLead':      return json_(handleDeleteLead_(auth, data));
      case 'createNote':      return json_(handleCreateNote_(auth, data));
      case 'createCompany':   return json_(handleCreateCompany_(auth, data));
      case 'updateCompany':   return json_(handleUpdateCompany_(auth, data));
      case 'deleteCompany':   return json_(handleDeleteCompany_(auth, data));
      case 'createContact':   return json_(handleCreateContact_(auth, data));
      case 'updateContact':   return json_(handleUpdateContact_(auth, data));
      case 'deleteContact':   return json_(handleDeleteContact_(auth, data));
      case 'createProject':   return json_(handleCreateProject_(auth, data));
      case 'updateProject':   return json_(handleUpdateProject_(auth, data));
      case 'deleteProject':   return json_(handleDeleteProject_(auth, data));
      case 'createTask':      return json_(handleCreateTask_(auth, data));
      case 'updateTask':      return json_(handleUpdateTask_(auth, data));
      case 'createUser':      return json_(handleCreateUser_(auth, data));
      case 'updateUser':      return json_(handleUpdateUser_(auth, data));
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

  // Slide the session window only when more than half has elapsed.
  // This avoids a Sheets write (and cache invalidation) on every request.
  var halfWindowMs = SESSION_HOURS * 0.5 * 3600 * 1000;
  var expiryTime   = new Date(user.session_expires_at).getTime();
  if (expiryTime - Date.now() < halfWindowMs) {
    var newExpiry = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();
    updateUserSession_(user.user_id, auth.token, newExpiry, null);
  }

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
      // Batch all session-related writes into a single range update
      // to avoid multiple Sheets API round-trips per request.
      var tokenCol   = COLS.USERS.session_token;
      var expiryCol  = COLS.USERS.session_expires_at;
      var loginCol   = COLS.USERS.last_login_at;
      var minCol     = Math.min(tokenCol, expiryCol, lastLoginAt ? loginCol : tokenCol);
      var maxCol     = Math.max(tokenCol, expiryCol, lastLoginAt ? loginCol : expiryCol);
      var numCols_   = maxCol - minCol + 1;
      var vals       = new Array(numCols_).fill('');
      vals[tokenCol  - minCol] = token;
      vals[expiryCol - minCol] = expiresAt;
      if (lastLoginAt) vals[loginCol - minCol] = lastLoginAt;
      sh.getRange(rowNum, minCol, 1, numCols_).setValues([vals]);
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
// M1 — LEADS HANDLERS
// ============================================================

/**
 * GET getLeads — returns all non-deleted leads as lean summary objects.
 * Heavy fields (message, user_agent, UTMs, etc.) are excluded to keep the
 * response small; use getLead for the full record.
 */
function handleGetLeads_(auth, params) {
  requireAuth_(auth);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.LEADS);
  if (!sh || sh.getLastRow() < 2) {
    return { ok: true, data: { leads: [] } };
  }

  var numCols = Object.keys(COLS.LEADS).length;
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();

  var leads = [];
  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];
    var leadId    = row[COLS.LEADS.lead_id - 1];
    var deletedAt = row[COLS.LEADS.deleted_at - 1];
    if (!leadId || deletedAt) continue;

    leads.push({
      lead_id:          leadId,
      received:         row[COLS.LEADS.received - 1],
      status:           row[COLS.LEADS.status - 1],
      priority:         row[COLS.LEADS.priority - 1],
      owner:            row[COLS.LEADS.owner - 1],
      next_action:      row[COLS.LEADS.next_action - 1],
      next_action_date: row[COLS.LEADS.next_action_date - 1],
      updated_at:       row[COLS.LEADS.updated_at - 1],
      first_name:       row[COLS.LEADS.first_name - 1],
      last_name:        row[COLS.LEADS.last_name - 1],
      full_name:        row[COLS.LEADS.full_name - 1],
      company_name:     row[COLS.LEADS.company_name - 1],
      email:            row[COLS.LEADS.email - 1],
      phone:            row[COLS.LEADS.phone - 1],
      interest:         row[COLS.LEADS.interest - 1],
      language:         row[COLS.LEADS.language - 1],
      deleted_at:       deletedAt,
      trade_direction:  row[COLS.LEADS.trade_direction - 1]
    });
  }

  return { ok: true, data: { leads: leads } };
}

/**
 * GET getLead — returns the full Lead record for a given lead_id.
 */
function handleGetLead_(auth, params) {
  requireAuth_(auth);

  var leadId = String(params.leadId || '').trim();
  if (!leadId) throw new Error(ERR.VALIDATION);

  var found = getLeadById_(leadId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  return { ok: true, data: { lead: found.record } };
}

/**
 * GET getTimeline — merges Notes and Activities for an entity, newest first.
 */
function handleGetTimeline_(auth, params) {
  requireAuth_(auth);

  var entityType = String(params.entityType || '').trim();
  var entityId   = String(params.entityId || '').trim();
  if (!entityType || !entityId) throw new Error(ERR.VALIDATION);

  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var items = [];

  // Collect notes
  var notesSh = ss.getSheetByName(SHEET.NOTES);
  if (notesSh && notesSh.getLastRow() >= 2) {
    var notesCols = Object.keys(COLS.NOTES).length;
    var notesData = notesSh.getRange(2, 1, notesSh.getLastRow() - 1, notesCols).getValues();
    for (var n = 0; n < notesData.length; n++) {
      var note = rowToObject_(COLS.NOTES, notesData[n]);
      if (note.note_id && note.entity_type === entityType && note.entity_id === entityId && !note.deleted_at) {
        note._kind = 'note';
        note._sortKey = note.created_at;
        items.push(note);
      }
    }
  }

  // Collect activities
  var actSh = ss.getSheetByName(SHEET.ACTIVITIES);
  if (actSh && actSh.getLastRow() >= 2) {
    var actCols = Object.keys(COLS.ACTIVITIES).length;
    var actData = actSh.getRange(2, 1, actSh.getLastRow() - 1, actCols).getValues();
    for (var a = 0; a < actData.length; a++) {
      var act = rowToObject_(COLS.ACTIVITIES, actData[a]);
      if (act.activity_id && act.entity_type === entityType && act.entity_id === entityId) {
        act._kind = 'activity';
        act._sortKey = act.performed_at;
        items.push(act);
      }
    }
  }

  // Sort newest first
  items.sort(function(a, b) {
    if (b._sortKey < a._sortKey) return -1;
    if (b._sortKey > a._sortKey) return 1;
    return 0;
  });

  return { ok: true, data: { items: items } };
}

/**
 * POST updateLead — update editable CRM fields on a lead.
 * Only the fields in WRITABLE_FIELDS can be changed via this action.
 * A status change is recorded as an Activity automatically.
 */
function handleUpdateLead_(auth, data) {
  var user = requireAuth_(auth);

  var leadId = String(data.leadId || '').trim();
  if (!leadId) throw new Error(ERR.VALIDATION);

  var found = getLeadById_(leadId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var WRITABLE = {
    status:           true,
    priority:         true,
    owner:            true,
    next_action:      true,
    next_action_date: true,
    notes:            true,
    trade_direction:  true,
    company_id:       true,
    contact_id:       true
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.LEADS);
  if (!sh) throw new Error(ERR.INTERNAL);

  var fields     = data.fields || {};
  var prevStatus = found.record.status;
  var updates    = {};
  var now        = new Date().toISOString();

  Object.keys(fields).forEach(function(key) {
    if (WRITABLE[key] && COLS.LEADS[key] !== undefined) {
      var val = fields[key];
      updates[key] = (val !== null && val !== undefined) ? sanitize_(String(val)) : '';
    }
  });

  if (!Object.keys(updates).length) {
    return { ok: true, data: { lead: found.record } };
  }

  updates.updated_at = now;
  updates.updated_by = user.user_id;

  batchWriteRow_(sh, found.rowNum, COLS.LEADS, updates);

  if (updates.status && updates.status !== prevStatus) {
    logActivity_('Lead', leadId, 'status_changed',
      'Status changed from ' + prevStatus + ' to ' + updates.status,
      '', user.user_id);
  }

  var updated = getLeadById_(leadId);
  return { ok: true, data: { lead: updated ? updated.record : found.record } };
}

// ============================================================
// M1 — NOTES HANDLER
// ============================================================

/**
 * POST createNote — add a polymorphic note to any entity.
 * Works for Leads now; same action will serve Companies, Contacts, Projects in M2+.
 */
function handleCreateNote_(auth, data) {
  var user = requireAuth_(auth);

  var entityType = sanitize_(data.entityType || '');
  var entityId   = sanitize_(data.entityId || '');
  var content    = sanitize_(data.content || '');

  if (!entityType || !entityId || !content) throw new Error(ERR.VALIDATION);

  var ALLOWED_TYPES = ['Lead', 'Company', 'Contact', 'Project'];
  if (ALLOWED_TYPES.indexOf(entityType) === -1) throw new Error(ERR.VALIDATION);

  var ss  = SpreadsheetApp.getActiveSpreadsheet();
  var sh  = getOrCreateSheet_(SHEET.NOTES);
  var now = new Date().toISOString();
  var noteId = makeId_('NOT', new Date());

  var row = buildRow_(COLS.NOTES, {
    note_id:        noteId,
    entity_type:    entityType,
    entity_id:      entityId,
    content:        content,
    author_user_id: user.user_id,
    created_at:     now,
    updated_at:     now,
    deleted_at:     ''
  });
  sh.appendRow(row);

  return {
    ok: true,
    data: {
      note: {
        note_id:        noteId,
        entity_type:    entityType,
        entity_id:      entityId,
        content:        content,
        author_user_id: user.user_id,
        created_at:     now,
        updated_at:     now,
        deleted_at:     ''
      }
    }
  };
}

// ============================================================
// M2 — COMPANIES HANDLERS
// ============================================================

function handleGetCompanies_(auth, params) {
  requireAuth_(auth);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.COMPANIES);
  if (!sh || sh.getLastRow() < 2) {
    return { ok: true, data: { companies: [] } };
  }

  var numCols = Object.keys(COLS.COMPANIES).length;
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();

  var companies = [];
  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];
    var id        = row[COLS.COMPANIES.company_id - 1];
    var deletedAt = row[COLS.COMPANIES.deleted_at - 1];
    if (!id || deletedAt) continue;

    companies.push({
      company_id:         id,
      name:               row[COLS.COMPANIES.name - 1],
      type:               row[COLS.COMPANIES.type - 1],
      country:            row[COLS.COMPANIES.country - 1],
      city:               row[COLS.COMPANIES.city - 1],
      industry:           row[COLS.COMPANIES.industry - 1],
      trade_direction:    row[COLS.COMPANIES.trade_direction - 1],
      email:              row[COLS.COMPANIES.email - 1],
      phone:              row[COLS.COMPANIES.phone - 1],
      status:             row[COLS.COMPANIES.status - 1],
      owner_user_id:      row[COLS.COMPANIES.owner_user_id - 1],
      primary_contact_id: row[COLS.COMPANIES.primary_contact_id - 1],
      deleted_at:         deletedAt
    });
  }

  return { ok: true, data: { companies: companies } };
}

function handleGetCompany_(auth, params) {
  requireAuth_(auth);

  var companyId = String(params.companyId || '').trim();
  if (!companyId) throw new Error(ERR.VALIDATION);

  var found = getCompanyById_(companyId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  return { ok: true, data: { company: found.record } };
}

function handleCreateCompany_(auth, data) {
  var user = requireAuth_(auth);

  var name = sanitize_(data.name || '');
  if (!name) throw new Error(ERR.VALIDATION);

  var sh  = getOrCreateSheet_(SHEET.COMPANIES);
  var now = new Date().toISOString();
  var companyId = makeId_('CMP', new Date());

  var row = buildRow_(COLS.COMPANIES, {
    company_id:         companyId,
    name:               name,
    type:               sanitize_(data.type || ''),
    country:            sanitize_(data.country || ''),
    city:               sanitize_(data.city || ''),
    industry:           sanitize_(data.industry || ''),
    trade_direction:    sanitize_(data.trade_direction || ''),
    website:            sanitize_(data.website || ''),
    linkedin:           sanitize_(data.linkedin || ''),
    email:              sanitize_(data.email || ''),
    phone:              sanitize_(data.phone || ''),
    status:             sanitize_(data.status || 'Active'),
    owner_user_id:      user.user_id,
    primary_contact_id: '',
    created_at:         now,
    created_by:         user.user_id,
    updated_at:         now,
    updated_by:         user.user_id,
    deleted_at:         '',
    notes:              sanitize_(data.notes || '')
  });
  sh.appendRow(row);

  logActivity_('Company', companyId, 'company_created',
    'Company created: ' + name, '', user.user_id);

  return { ok: true, data: { company_id: companyId } };
}

function handleUpdateCompany_(auth, data) {
  var user = requireAuth_(auth);

  var companyId = String(data.companyId || '').trim();
  if (!companyId) throw new Error(ERR.VALIDATION);

  var found = getCompanyById_(companyId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var WRITABLE = {
    name: true, type: true, country: true, city: true, industry: true,
    trade_direction: true, website: true, linkedin: true, email: true,
    phone: true, status: true, notes: true, owner_user_id: true
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.COMPANIES);
  if (!sh) throw new Error(ERR.INTERNAL);

  var fields  = data.fields || {};
  var updates = {};
  var now     = new Date().toISOString();

  Object.keys(fields).forEach(function(key) {
    if (WRITABLE[key] && COLS.COMPANIES[key] !== undefined) {
      var val = fields[key];
      updates[key] = (val !== null && val !== undefined) ? sanitize_(String(val)) : '';
    }
  });

  if (!Object.keys(updates).length) {
    return { ok: true, data: { company: found.record } };
  }

  updates.updated_at = now;
  updates.updated_by = user.user_id;

  batchWriteRow_(sh, found.rowNum, COLS.COMPANIES, updates);

  var updated = getCompanyById_(companyId);
  return { ok: true, data: { company: updated ? updated.record : found.record } };
}

// ============================================================
// M2 — CONTACTS HANDLERS
// ============================================================

function handleGetContacts_(auth, params) {
  requireAuth_(auth);

  var filterCompanyId = String(params.companyId || '').trim();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.CONTACTS);
  if (!sh || sh.getLastRow() < 2) {
    return { ok: true, data: { contacts: [] } };
  }

  var numCols = Object.keys(COLS.CONTACTS).length;
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();

  var contacts = [];
  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];
    var id        = row[COLS.CONTACTS.contact_id - 1];
    var deletedAt = row[COLS.CONTACTS.deleted_at - 1];
    if (!id || deletedAt) continue;
    if (filterCompanyId && row[COLS.CONTACTS.company_id - 1] !== filterCompanyId) continue;

    contacts.push({
      contact_id:    id,
      company_id:    row[COLS.CONTACTS.company_id - 1],
      first_name:    row[COLS.CONTACTS.first_name - 1],
      last_name:     row[COLS.CONTACTS.last_name - 1],
      full_name:     row[COLS.CONTACTS.full_name - 1],
      title:         row[COLS.CONTACTS.title - 1],
      email:         row[COLS.CONTACTS.email - 1],
      phone:         row[COLS.CONTACTS.phone - 1],
      language:      row[COLS.CONTACTS.language - 1],
      is_primary:    row[COLS.CONTACTS.is_primary - 1],
      status:        row[COLS.CONTACTS.status - 1],
      owner_user_id: row[COLS.CONTACTS.owner_user_id - 1],
      deleted_at:    deletedAt
    });
  }

  return { ok: true, data: { contacts: contacts } };
}

function handleGetContact_(auth, params) {
  requireAuth_(auth);

  var contactId = String(params.contactId || '').trim();
  if (!contactId) throw new Error(ERR.VALIDATION);

  var found = getContactById_(contactId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  return { ok: true, data: { contact: found.record } };
}

function handleCreateContact_(auth, data) {
  var user = requireAuth_(auth);

  var firstName = sanitize_(data.first_name || '');
  var lastName  = sanitize_(data.last_name || '');
  if (!firstName || !lastName) throw new Error(ERR.VALIDATION);

  var sh  = getOrCreateSheet_(SHEET.CONTACTS);
  var now = new Date().toISOString();
  var contactId = makeId_('CON', new Date());
  var fullName  = (firstName + ' ' + lastName).trim();

  // is_primary should be a boolean — sheet checkboxes expect TRUE/FALSE
  var isPrimary = data.is_primary === true || data.is_primary === 'true';

  var row = buildRow_(COLS.CONTACTS, {
    contact_id:    contactId,
    company_id:    sanitize_(data.company_id || ''),
    first_name:    firstName,
    last_name:     lastName,
    full_name:     fullName,
    title:         sanitize_(data.title || ''),
    email:         sanitize_(data.email || ''),
    phone:         sanitize_(data.phone || ''),
    linkedin:      sanitize_(data.linkedin || ''),
    language:      sanitize_(data.language || ''),
    is_primary:    isPrimary,
    status:        sanitize_(data.status || 'Active'),
    owner_user_id: user.user_id,
    created_at:    now,
    created_by:    user.user_id,
    updated_at:    now,
    updated_by:    user.user_id,
    deleted_at:    ''
  });
  sh.appendRow(row);

  logActivity_('Contact', contactId, 'contact_created',
    'Contact created: ' + fullName, '', user.user_id);

  return { ok: true, data: { contact_id: contactId } };
}

function handleUpdateContact_(auth, data) {
  var user = requireAuth_(auth);

  var contactId = String(data.contactId || '').trim();
  if (!contactId) throw new Error(ERR.VALIDATION);

  var found = getContactById_(contactId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var WRITABLE = {
    first_name: true, last_name: true, full_name: true, title: true,
    email: true, phone: true, linkedin: true, language: true,
    is_primary: true, status: true, company_id: true, owner_user_id: true
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.CONTACTS);
  if (!sh) throw new Error(ERR.INTERNAL);

  var fields  = data.fields || {};
  var updates = {};
  var now     = new Date().toISOString();

  Object.keys(fields).forEach(function(key) {
    if (WRITABLE[key] && COLS.CONTACTS[key] !== undefined) {
      var val = fields[key];
      if (key === 'is_primary') {
        updates[key] = (val === true || val === 'true');
      } else {
        updates[key] = (val !== null && val !== undefined) ? sanitize_(String(val)) : '';
      }
    }
  });

  if (!Object.keys(updates).length) {
    return { ok: true, data: { contact: found.record } };
  }

  updates.updated_at = now;
  updates.updated_by = user.user_id;

  batchWriteRow_(sh, found.rowNum, COLS.CONTACTS, updates);

  var updated = getContactById_(contactId);
  return { ok: true, data: { contact: updated ? updated.record : found.record } };
}

// ============================================================
// RECORD LOOKUP HELPERS
// ============================================================

/**
 * Find any record by its ID field. Returns { rowNum, record } or null.
 * rowNum is 1-indexed (accounts for the header row).
 * Used by all entity handlers — avoids duplicating the search loop per sheet.
 */
function getRecordById_(sheetName, colMap, idField, idValue) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return null;

  var numCols = Object.keys(colMap).length;
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();

  for (var i = 0; i < rows.length; i++) {
    if (rows[i][colMap[idField] - 1] === idValue) {
      return { rowNum: i + 2, record: rowToObject_(colMap, rows[i]) };
    }
  }
  return null;
}

function getLeadById_(leadId) {
  return getRecordById_(SHEET.LEADS, COLS.LEADS, 'lead_id', leadId);
}

function getCompanyById_(companyId) {
  return getRecordById_(SHEET.COMPANIES, COLS.COMPANIES, 'company_id', companyId);
}

function getContactById_(contactId) {
  return getRecordById_(SHEET.CONTACTS, COLS.CONTACTS, 'contact_id', contactId);
}

/**
 * Write a sparse set of column updates to a single row in one Sheets API call.
 * Reads the affected range first so non-updated cells are preserved.
 * updates: { fieldName: value } where fieldName must exist in colMap.
 */
function batchWriteRow_(sh, rowNum, colMap, updates) {
  var keys = Object.keys(updates).filter(function(k) { return colMap[k] !== undefined; });
  if (!keys.length) return;

  var minCol = Infinity, maxCol = 0;
  keys.forEach(function(k) {
    if (colMap[k] < minCol) minCol = colMap[k];
    if (colMap[k] > maxCol) maxCol = colMap[k];
  });

  var width    = maxCol - minCol + 1;
  var existing = sh.getRange(rowNum, minCol, 1, width).getValues()[0];

  keys.forEach(function(k) {
    existing[colMap[k] - minCol] = updates[k];
  });

  sh.getRange(rowNum, minCol, 1, width).setValues([existing]);
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
 * Run this once after pasting Code.gs, then again on every schema version bump.
 */
function setupCrm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  setupLeadsSheet_(ss);
  setupUsersSheet_(ss);
  setupCompaniesSheet_(ss);
  setupContactsSheet_(ss);
  setupProjectsSheet_(ss);
  setupTasksSheet_(ss);
  setupNotesSheet_(ss);
  setupActivitiesSheet_(ss);
  setupSettingsSheet_(ss);
  setupMetaSheet_(ss);
  createDashboard_(ss);
  createReadme_(ss);

  // Move utility sheets to the end so data sheets come first
  var tabOrder = [
    SHEET.LEADS, SHEET.COMPANIES, SHEET.CONTACTS, SHEET.PROJECTS,
    SHEET.TASKS, SHEET.NOTES, SHEET.ACTIVITIES, SHEET.USERS,
    SHEET.SETTINGS, SHEET.META, SHEET.DASHBOARD, SHEET.README
  ];
  tabOrder.forEach(function(name, idx) {
    var sh = ss.getSheetByName(name);
    if (sh) ss.moveActiveSheet && ss.setActiveSheet(sh) && ss.moveActiveSheet(idx + 1);
  });

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

  // Append any headers that are missing entirely.
  // We never reorder existing columns — data integrity trumps schema alignment.
  var nextCol = lastCol;
  for (var i = 0; i < expectedHeaders.length; i++) {
    if (existing.indexOf(expectedHeaders[i]) === -1) {
      nextCol++;
      sh.getRange(1, nextCol).setValue(expectedHeaders[i]);
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

  // Title
  sh.getRange(1, 1, 1, 6).merge().setValue('Valeris CRM — Dashboard');
  sh.getRange(1, 1).setFontWeight('bold').setFontSize(14)
    .setFontColor('#F1E4D1').setBackground('#071917');
  sh.setRowHeight(1, 36);

  // KPI headers row
  sh.getRange(3, 1, 1, 6).setValues([['Leads', '', 'Projects', '', 'Tasks', '']]);
  sh.getRange(3, 1, 1, 6).setFontWeight('bold').setFontColor('#F1E4D1').setBackground('#113632');

  // KPIs
  sh.getRange(4, 1, 5, 2).setValues([
    ['Total leads',       '=COUNTA(Leads!B2:B)'],
    ['Open leads',        '=COUNTIF(Leads!C2:C,"New")+COUNTIF(Leads!C2:C,"Contacted")+COUNTIF(Leads!C2:C,"Qualified")+COUNTIF(Leads!C2:C,"Proposal")'],
    ['Won',               '=COUNTIF(Leads!C2:C,"Won")'],
    ['High priority',     '=COUNTIF(Leads!D2:D,"High")'],
    ['New this month',    '=COUNTIFS(Leads!A2:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),Leads!B2:B,"<>")']
  ]);

  sh.getRange(4, 3, 4, 2).setValues([
    ['Total projects',    '=COUNTA(Projects!A2:A)'],
    ['Active',            '=COUNTIF(Projects!H2:H,"Active")'],
    ['Completed',         '=COUNTIF(Projects!H2:H,"Completed")'],
    ['On hold',           '=COUNTIF(Projects!H2:H,"On Hold")']
  ]);

  sh.getRange(4, 5, 4, 2).setValues([
    ['Total tasks',       '=COUNTA(Tasks!A2:A)'],
    ['Open',              '=COUNTIF(Tasks!F2:F,"Open")+COUNTIF(Tasks!F2:F,"In Progress")'],
    ['Due today',         '=COUNTIFS(Tasks!I2:I,TODAY(),Tasks!F2:F,"<>Done",Tasks!F2:F,"<>Cancelled")'],
    ['Overdue',           '=COUNTIFS(Tasks!I2:I,"<"&TODAY(),Tasks!F2:F,"<>Done",Tasks!F2:F,"<>Cancelled")']
  ]);

  sh.getRange(4, 1, 5, 1).setFontWeight('bold');
  sh.getRange(4, 3, 4, 1).setFontWeight('bold');
  sh.getRange(4, 5, 4, 1).setFontWeight('bold');

  // Lead status breakdown
  sh.getRange(11, 1, 1, 2).setValues([['Lead Status', 'Count']]);
  sh.getRange(11, 1, 1, 2).setFontWeight('bold').setFontColor('#F1E4D1').setBackground('#071917');
  sh.getRange(12, 1, LEAD_STATUSES.length, 2).setValues(
    LEAD_STATUSES.map(function(s) {
      return [s, '=COUNTIF(Leads!C2:C,"' + s + '")'];
    })
  );

  // Interest breakdown
  sh.getRange(11, 4, 1, 2).setValues([['Interest', 'Count']]);
  sh.getRange(11, 4, 1, 2).setFontWeight('bold').setFontColor('#F1E4D1').setBackground('#071917');
  sh.getRange(12, 4, SERVICES.length, 2).setValues(
    SERVICES.map(function(s) {
      return [s, '=COUNTIF(Leads!O2:O,"' + s + '")'];
    })
  );

  // Column widths
  sh.setColumnWidth(1, 170);
  sh.setColumnWidth(2, 90);
  sh.setColumnWidth(3, 170);
  sh.setColumnWidth(4, 280);
  sh.setColumnWidth(5, 170);
  sh.setColumnWidth(6, 90);
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

/**
 * Reset a team member's password.
 * Run from the Apps Script editor — not callable via HTTP.
 *
 * Usage: changePassword('USR-20260701120000000-abc123', 'new-password')
 */
function changePassword(userId, newPlainPassword) {
  if (!userId || !newPlainPassword) {
    throw new Error('userId and newPlainPassword are both required');
  }
  var user = getUserById_(userId);
  if (!user) throw new Error('User not found: ' + userId);

  var salt = Utilities.getUuid();
  var hash = hashPassword_(newPlainPassword, salt);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.USERS);
  if (!sh) throw new Error('Users sheet not found');

  var numCols = Object.keys(COLS.USERS).length;
  var data = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues()
    : [];

  for (var i = 0; i < data.length; i++) {
    if (data[i][COLS.USERS.user_id - 1] === userId) {
      var rowNum = i + 2;
      var hashCol = COLS.USERS.password_hash;
      var saltCol = COLS.USERS.password_salt;
      var minCol  = Math.min(hashCol, saltCol);
      var vals    = ['', ''];
      vals[hashCol - minCol] = hash;
      vals[saltCol - minCol] = salt;
      sh.getRange(rowNum, minCol, 1, 2).setValues([vals]);
      // Invalidate any existing session so the user must log in with the new password
      sh.getRange(rowNum, COLS.USERS.session_token).setValue('');
      sh.getRange(rowNum, COLS.USERS.session_expires_at).setValue('');
      invalidateCache_('users');
      return 'Password changed for: ' + user.email;
    }
  }
  throw new Error('User row not found in sheet: ' + userId);
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

// ============================================================
// M3 — PROJECTS HANDLERS
// ============================================================

function handleGetProjects_(auth, params) {
  requireAuth_(auth);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.PROJECTS);
  if (!sh || sh.getLastRow() < 2) return { ok: true, data: { projects: [] } };

  var numCols = Object.keys(COLS.PROJECTS).length;
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();

  var filterCompanyId = String(params.companyId || '').trim();
  var filterStatus    = String(params.status    || '').trim();

  var projects = [];
  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];
    var id        = row[COLS.PROJECTS.project_id - 1];
    var deletedAt = row[COLS.PROJECTS.deleted_at - 1];
    if (!id || deletedAt) continue;
    if (filterCompanyId && row[COLS.PROJECTS.company_id - 1] !== filterCompanyId) continue;
    if (filterStatus    && row[COLS.PROJECTS.status - 1]    !== filterStatus)    continue;

    projects.push({
      project_id:         id,
      lead_id:            row[COLS.PROJECTS.lead_id - 1],
      company_id:         row[COLS.PROJECTS.company_id - 1],
      contact_id:         row[COLS.PROJECTS.contact_id - 1],
      name:               row[COLS.PROJECTS.name - 1],
      service_line:       row[COLS.PROJECTS.service_line - 1],
      trade_direction:    row[COLS.PROJECTS.trade_direction - 1],
      status:             row[COLS.PROJECTS.status - 1],
      phase:              row[COLS.PROJECTS.phase - 1],
      priority:           row[COLS.PROJECTS.priority - 1],
      owner_user_id:      row[COLS.PROJECTS.owner_user_id - 1],
      operations_user_id: row[COLS.PROJECTS.operations_user_id - 1],
      start_date:         row[COLS.PROJECTS.start_date - 1],
      target_end_date:    row[COLS.PROJECTS.target_end_date - 1],
      deleted_at:         deletedAt
    });
  }
  return { ok: true, data: { projects: projects } };
}

function handleGetProject_(auth, params) {
  requireAuth_(auth);
  var projectId = String(params.projectId || '').trim();
  if (!projectId) throw new Error(ERR.VALIDATION);
  var found = getProjectById_(projectId);
  if (!found) throw new Error(ERR.NOT_FOUND);
  return { ok: true, data: { project: found.record } };
}

function handleCreateProject_(auth, data) {
  var user = requireAuth_(auth);

  var name = sanitize_(data.name || '');
  if (!name) throw new Error(ERR.VALIDATION);

  var sh        = getOrCreateSheet_(SHEET.PROJECTS);
  var now       = new Date().toISOString();
  var projectId = makeId_('PRJ', new Date());

  var row = buildRow_(COLS.PROJECTS, {
    project_id:         projectId,
    lead_id:            sanitize_(data.lead_id            || ''),
    company_id:         sanitize_(data.company_id         || ''),
    contact_id:         sanitize_(data.contact_id         || ''),
    name:               name,
    service_line:       sanitize_(data.service_line       || ''),
    trade_direction:    sanitize_(data.trade_direction    || ''),
    status:             sanitize_(data.status             || 'Active'),
    phase:              sanitize_(data.phase              || 'Discovery'),
    priority:           sanitize_(data.priority           || 'Medium'),
    owner_user_id:      sanitize_(data.owner_user_id      || user.user_id),
    operations_user_id: sanitize_(data.operations_user_id || ''),
    start_date:         sanitize_(data.start_date         || ''),
    target_end_date:    sanitize_(data.target_end_date    || ''),
    actual_end_date:    '',
    description:        sanitize_(data.description        || ''),
    created_at:         now,
    created_by:         user.user_id,
    updated_at:         now,
    updated_by:         user.user_id,
    deleted_at:         ''
  });
  sh.appendRow(row);

  logActivity_('Project', projectId, 'project_created',
    'Project created: ' + name, '', user.user_id);

  // If created from a lead, mark it converted
  if (data.lead_id) {
    try {
      var leadFound = getLeadById_(String(data.lead_id));
      if (leadFound) {
        var leadSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.LEADS);
        batchWriteRow_(leadSh, leadFound.rowNum, COLS.LEADS, {
          status: 'Won',
          converted_to_project_id: projectId,
          converted_at: now,
          converted_by: user.user_id,
          updated_at:   now,
          updated_by:   user.user_id
        });
        logActivity_('Lead', String(data.lead_id), 'converted_to_project',
          'Lead converted to project: ' + name, projectId, user.user_id);
      }
    } catch (e) {
      console.error('[Valeris] Lead conversion update failed:', String(e));
    }
  }

  return { ok: true, data: { project_id: projectId } };
}

function handleUpdateProject_(auth, data) {
  var user = requireAuth_(auth);

  var projectId = String(data.projectId || '').trim();
  if (!projectId) throw new Error(ERR.VALIDATION);

  var found = getProjectById_(projectId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var WRITABLE = {
    name: true, service_line: true, trade_direction: true,
    status: true, phase: true, priority: true,
    owner_user_id: true, operations_user_id: true,
    start_date: true, target_end_date: true, actual_end_date: true,
    description: true, company_id: true, contact_id: true
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.PROJECTS);
  if (!sh) throw new Error(ERR.INTERNAL);

  var fields     = data.fields || {};
  var updates    = {};
  var now        = new Date().toISOString();
  var prevStatus = found.record.status;

  Object.keys(fields).forEach(function(key) {
    if (WRITABLE[key] && COLS.PROJECTS[key] !== undefined) {
      var val = fields[key];
      updates[key] = (val !== null && val !== undefined) ? sanitize_(String(val)) : '';
    }
  });

  if (!Object.keys(updates).length) return { ok: true, data: { project: found.record } };

  updates.updated_at = now;
  updates.updated_by = user.user_id;

  batchWriteRow_(sh, found.rowNum, COLS.PROJECTS, updates);

  if (updates.status && updates.status !== prevStatus) {
    logActivity_('Project', projectId, 'status_changed',
      'Status changed from ' + prevStatus + ' to ' + updates.status,
      '', user.user_id);
  }

  var updated = getProjectById_(projectId);
  return { ok: true, data: { project: updated ? updated.record : found.record } };
}

function handleDeleteProject_(auth, data) {
  var user      = requireAuth_(auth);
  var projectId = String(data.projectId || '').trim();
  if (!projectId) throw new Error(ERR.VALIDATION);

  var found = getProjectById_(projectId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var ss  = SpreadsheetApp.getActiveSpreadsheet();
  var sh  = ss.getSheetByName(SHEET.PROJECTS);
  var now = new Date().toISOString();
  batchWriteRow_(sh, found.rowNum, COLS.PROJECTS, {
    deleted_at: now, updated_at: now, updated_by: user.user_id
  });
  logActivity_('Project', projectId, 'project_deleted', 'Project soft-deleted', '', user.user_id);
  return { ok: true };
}

// ============================================================
// M3 — TASKS HANDLERS
// ============================================================

function handleGetTasks_(auth, params) {
  requireAuth_(auth);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.TASKS);
  if (!sh || sh.getLastRow() < 2) return { ok: true, data: { tasks: [] } };

  var numCols = Object.keys(COLS.TASKS).length;
  var rows    = sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues();

  var filterEntityType = String(params.entityType || '').trim();
  var filterEntityId   = String(params.entityId   || '').trim();
  var filterAssigned   = String(params.assignedTo || '').trim();
  var filterStatus     = String(params.status     || '').trim();

  var tasks = [];
  for (var i = rows.length - 1; i >= 0; i--) {
    var row       = rows[i];
    var id        = row[COLS.TASKS.task_id    - 1];
    var deletedAt = row[COLS.TASKS.deleted_at - 1];
    if (!id || deletedAt) continue;
    if (filterEntityType && row[COLS.TASKS.entity_type - 1] !== filterEntityType) continue;
    if (filterEntityId   && row[COLS.TASKS.entity_id   - 1] !== filterEntityId)   continue;
    if (filterAssigned   && row[COLS.TASKS.assigned_to - 1] !== filterAssigned)   continue;
    if (filterStatus     && row[COLS.TASKS.status      - 1] !== filterStatus)     continue;

    tasks.push({
      task_id:      id,
      entity_type:  row[COLS.TASKS.entity_type  - 1],
      entity_id:    row[COLS.TASKS.entity_id    - 1],
      title:        row[COLS.TASKS.title         - 1],
      description:  row[COLS.TASKS.description  - 1],
      status:       row[COLS.TASKS.status        - 1],
      priority:     row[COLS.TASKS.priority      - 1],
      assigned_to:  row[COLS.TASKS.assigned_to  - 1],
      due_date:     row[COLS.TASKS.due_date      - 1],
      completed_at: row[COLS.TASKS.completed_at - 1],
      completed_by: row[COLS.TASKS.completed_by - 1],
      created_at:   row[COLS.TASKS.created_at   - 1],
      created_by:   row[COLS.TASKS.created_by   - 1],
      deleted_at:   deletedAt
    });
  }
  return { ok: true, data: { tasks: tasks } };
}

function handleGetTask_(auth, params) {
  requireAuth_(auth);
  var taskId = String(params.taskId || '').trim();
  if (!taskId) throw new Error(ERR.VALIDATION);
  var found = getTaskById_(taskId);
  if (!found) throw new Error(ERR.NOT_FOUND);
  return { ok: true, data: { task: found.record } };
}

function handleCreateTask_(auth, data) {
  var user  = requireAuth_(auth);
  var title = sanitize_(data.title || '');
  if (!title) throw new Error(ERR.VALIDATION);

  var sh     = getOrCreateSheet_(SHEET.TASKS);
  var now    = new Date().toISOString();
  var taskId = makeId_('TSK', new Date());

  var row = buildRow_(COLS.TASKS, {
    task_id:      taskId,
    entity_type:  sanitize_(data.entity_type || ''),
    entity_id:    sanitize_(data.entity_id   || ''),
    title:        title,
    description:  sanitize_(data.description || ''),
    status:       sanitize_(data.status      || 'Open'),
    priority:     sanitize_(data.priority    || 'Medium'),
    assigned_to:  sanitize_(data.assigned_to || user.user_id),
    due_date:     sanitize_(data.due_date    || ''),
    completed_at: '',
    completed_by: '',
    created_at:   now,
    created_by:   user.user_id,
    updated_at:   now,
    updated_by:   user.user_id,
    deleted_at:   ''
  });
  sh.appendRow(row);

  if (data.entity_type && data.entity_id) {
    try {
      logActivity_(sanitize_(data.entity_type), sanitize_(data.entity_id), 'task_created',
        'Task created: ' + title, '', user.user_id);
    } catch (e) {}
  }

  return { ok: true, data: { task_id: taskId } };
}

function handleUpdateTask_(auth, data) {
  var user   = requireAuth_(auth);
  var taskId = String(data.taskId || '').trim();
  if (!taskId) throw new Error(ERR.VALIDATION);

  var found = getTaskById_(taskId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var WRITABLE = {
    title: true, description: true, status: true, priority: true,
    assigned_to: true, due_date: true, entity_type: true, entity_id: true
  };

  var ss         = SpreadsheetApp.getActiveSpreadsheet();
  var sh         = ss.getSheetByName(SHEET.TASKS);
  if (!sh) throw new Error(ERR.INTERNAL);

  var fields     = data.fields || {};
  var updates    = {};
  var now        = new Date().toISOString();
  var prevStatus = found.record.status;

  Object.keys(fields).forEach(function(key) {
    if (WRITABLE[key] && COLS.TASKS[key] !== undefined) {
      var val = fields[key];
      updates[key] = (val !== null && val !== undefined) ? sanitize_(String(val)) : '';
    }
  });

  if (updates.status === 'Done' && prevStatus !== 'Done') {
    updates.completed_at = now;
    updates.completed_by = user.user_id;
  }

  if (!Object.keys(updates).length) return { ok: true, data: { task: found.record } };

  updates.updated_at = now;
  updates.updated_by = user.user_id;

  batchWriteRow_(sh, found.rowNum, COLS.TASKS, updates);

  var updated = getTaskById_(taskId);
  return { ok: true, data: { task: updated ? updated.record : found.record } };
}

// ============================================================
// M4 — TEAM HANDLERS
// ============================================================

function handleGetUsers_(auth, params) {
  requireAuth_(auth);
  var users = getAllUsers_();
  var safe  = users.map(function(u) {
    return {
      user_id:      u.user_id,
      email:        u.email,
      full_name:    u.full_name,
      role:         u.role,
      status:       u.status,
      last_login_at: u.last_login_at || '',
      created_at:   u.created_at
    };
  });
  return { ok: true, data: { users: safe } };
}

function handleCreateUser_(auth, data) {
  var actor     = requireRole_(auth, ['Owner', 'Administrator']);
  var email     = sanitize_(data.email     || '');
  var fullName  = sanitize_(data.full_name || '');
  var role      = sanitize_(data.role      || 'Sales');
  var plainPass = String(data.password     || '');

  if (!email || !fullName || !plainPass) throw new Error(ERR.VALIDATION);
  if (ROLES.indexOf(role) === -1) throw new Error(ERR.VALIDATION);
  if ((role === 'Owner' || role === 'Administrator') && actor.role !== 'Owner') {
    throw new Error(ERR.FORBIDDEN);
  }

  var existing = getUserByEmail_(email);
  if (existing) {
    return { ok: false, error: 'A user with this email already exists', code: ERR.VALIDATION };
  }

  var salt      = Utilities.getUuid();
  var hash      = hashPassword_(plainPass, salt);
  var now       = new Date().toISOString();
  var userId    = makeId_('USR', new Date());

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.USERS);
  if (!sh) throw new Error(ERR.INTERNAL);

  var row = buildRow_(COLS.USERS, {
    user_id:       userId,
    email:         email.toLowerCase().trim(),
    full_name:     fullName,
    role:          role,
    status:        'Active',
    password_hash: hash,
    password_salt: salt,
    created_at:    now,
    created_by:    actor.user_id
  });
  sh.appendRow(row);
  invalidateCache_('users');

  logActivity_('User', userId, 'user_created',
    'Team member added: ' + fullName + ' (' + role + ')', '', actor.user_id);

  return { ok: true, data: { user_id: userId } };
}

function handleUpdateUser_(auth, data) {
  var actor  = requireRole_(auth, ['Owner', 'Administrator']);
  var userId = String(data.userId || '').trim();
  if (!userId) throw new Error(ERR.VALIDATION);

  var target = getUserById_(userId);
  if (!target) throw new Error(ERR.NOT_FOUND);

  // Administrators cannot edit other Owners or Administrators
  if (actor.role === 'Administrator' &&
      (target.role === 'Owner' || target.role === 'Administrator') &&
      target.user_id !== actor.user_id) {
    throw new Error(ERR.FORBIDDEN);
  }

  var WRITABLE = { full_name: true, role: true, status: true };
  var fields   = data.fields || {};
  var updates  = {};

  Object.keys(fields).forEach(function(key) {
    if (WRITABLE[key] && COLS.USERS[key] !== undefined) {
      var val = fields[key];
      updates[key] = (val !== null && val !== undefined) ? sanitize_(String(val)) : '';
    }
  });

  if (updates.role && (updates.role === 'Owner' || updates.role === 'Administrator') &&
      actor.role !== 'Owner') {
    throw new Error(ERR.FORBIDDEN);
  }

  if (!Object.keys(updates).length) return { ok: true };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET.USERS);
  if (!sh) throw new Error(ERR.INTERNAL);

  var numCols = Object.keys(COLS.USERS).length;
  var rows    = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, numCols).getValues()
    : [];

  for (var i = 0; i < rows.length; i++) {
    if (rows[i][COLS.USERS.user_id - 1] === userId) {
      batchWriteRow_(sh, i + 2, COLS.USERS, updates);
      invalidateCache_('users');
      break;
    }
  }

  return { ok: true };
}

// ============================================================
// M4 — SOFT DELETE HANDLERS
// ============================================================

function handleDeleteLead_(auth, data) {
  var user   = requireAuth_(auth);
  var leadId = String(data.leadId || '').trim();
  if (!leadId) throw new Error(ERR.VALIDATION);

  var found = getLeadById_(leadId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var sh  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.LEADS);
  var now = new Date().toISOString();
  batchWriteRow_(sh, found.rowNum, COLS.LEADS, {
    deleted_at: now, updated_at: now, updated_by: user.user_id
  });
  logActivity_('Lead', leadId, 'lead_deleted', 'Lead soft-deleted', '', user.user_id);
  return { ok: true };
}

function handleDeleteCompany_(auth, data) {
  var user      = requireAuth_(auth);
  var companyId = String(data.companyId || '').trim();
  if (!companyId) throw new Error(ERR.VALIDATION);

  var found = getCompanyById_(companyId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var sh  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.COMPANIES);
  var now = new Date().toISOString();
  batchWriteRow_(sh, found.rowNum, COLS.COMPANIES, {
    deleted_at: now, updated_at: now, updated_by: user.user_id
  });
  logActivity_('Company', companyId, 'company_deleted', 'Company soft-deleted', '', user.user_id);
  return { ok: true };
}

function handleDeleteContact_(auth, data) {
  var user      = requireAuth_(auth);
  var contactId = String(data.contactId || '').trim();
  if (!contactId) throw new Error(ERR.VALIDATION);

  var found = getContactById_(contactId);
  if (!found) throw new Error(ERR.NOT_FOUND);

  var sh  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.CONTACTS);
  var now = new Date().toISOString();
  batchWriteRow_(sh, found.rowNum, COLS.CONTACTS, {
    deleted_at: now, updated_at: now, updated_by: user.user_id
  });
  logActivity_('Contact', contactId, 'contact_deleted', 'Contact soft-deleted', '', user.user_id);
  return { ok: true };
}

// ============================================================
// DASHBOARD STATS
// ============================================================

function handleGetDashboardStats_(auth, params) {
  requireAuth_(auth);

  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var tz      = Session.getScriptTimeZone();
  var today   = new Date();
  var todayStr = Utilities.formatDate(today, tz, 'yyyy-MM-dd');
  var monthStart = Utilities.formatDate(
    new Date(today.getFullYear(), today.getMonth(), 1), tz, 'yyyy-MM-dd'
  );

  var stats = {
    leads:    { total: 0, byStatus: {}, newThisMonth: 0, highPriority: 0 },
    projects: { total: 0, active: 0, completed: 0 },
    tasks:    { total: 0, open: 0, dueToday: 0, overdue: 0 }
  };

  // Leads
  var leadsSh = ss.getSheetByName(SHEET.LEADS);
  if (leadsSh && leadsSh.getLastRow() >= 2) {
    var lCols = Object.keys(COLS.LEADS).length;
    var lRows = leadsSh.getRange(2, 1, leadsSh.getLastRow() - 1, lCols).getValues();
    lRows.forEach(function(row) {
      if (!row[COLS.LEADS.lead_id - 1] || row[COLS.LEADS.deleted_at - 1]) return;
      var status   = row[COLS.LEADS.status - 1];
      var priority = row[COLS.LEADS.priority - 1];
      var received = row[COLS.LEADS.received - 1];
      stats.leads.total++;
      stats.leads.byStatus[status] = (stats.leads.byStatus[status] || 0) + 1;
      if (priority === 'High') stats.leads.highPriority++;
      if (received) {
        try {
          var rStr = Utilities.formatDate(
            received instanceof Date ? received : new Date(received), tz, 'yyyy-MM-dd'
          );
          if (rStr >= monthStart) stats.leads.newThisMonth++;
        } catch (e) {}
      }
    });
  }

  // Projects
  var projSh = ss.getSheetByName(SHEET.PROJECTS);
  if (projSh && projSh.getLastRow() >= 2) {
    var pCols = Object.keys(COLS.PROJECTS).length;
    var pRows = projSh.getRange(2, 1, projSh.getLastRow() - 1, pCols).getValues();
    pRows.forEach(function(row) {
      if (!row[COLS.PROJECTS.project_id - 1] || row[COLS.PROJECTS.deleted_at - 1]) return;
      var status = row[COLS.PROJECTS.status - 1];
      stats.projects.total++;
      if (status === 'Active')    stats.projects.active++;
      if (status === 'Completed') stats.projects.completed++;
    });
  }

  // Tasks
  var tasksSh = ss.getSheetByName(SHEET.TASKS);
  if (tasksSh && tasksSh.getLastRow() >= 2) {
    var tCols = Object.keys(COLS.TASKS).length;
    var tRows = tasksSh.getRange(2, 1, tasksSh.getLastRow() - 1, tCols).getValues();
    tRows.forEach(function(row) {
      if (!row[COLS.TASKS.task_id - 1] || row[COLS.TASKS.deleted_at - 1]) return;
      var status  = row[COLS.TASKS.status - 1];
      var dueDate = row[COLS.TASKS.due_date - 1];
      stats.tasks.total++;
      if (status === 'Open' || status === 'In Progress') {
        stats.tasks.open++;
        if (dueDate) {
          try {
            var dStr = dueDate instanceof Date
              ? Utilities.formatDate(dueDate, tz, 'yyyy-MM-dd')
              : String(dueDate).slice(0, 10);
            if (dStr === todayStr)        stats.tasks.dueToday++;
            else if (dStr < todayStr)    stats.tasks.overdue++;
          } catch (e) {}
        }
      }
    });
  }

  return { ok: true, data: { stats: stats } };
}

// ============================================================
// PROJECT & TASK LOOKUP HELPERS
// ============================================================

function getProjectById_(projectId) {
  return getRecordById_(SHEET.PROJECTS, COLS.PROJECTS, 'project_id', projectId);
}

function getTaskById_(taskId) {
  return getRecordById_(SHEET.TASKS, COLS.TASKS, 'task_id', taskId);
}

// ============================================================
// FULL SHEET SETUP FUNCTIONS (per entity)
// ============================================================

function setupCompaniesSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.COMPANIES);
  var sh = setupSheet_(ss, SHEET.COMPANIES, headers);
  sh.setFrozenColumns(2);

  var lastRow = Math.max(sh.getMaxRows(), 1000);
  sh.getRange(2, COLS.COMPANIES.type,            lastRow - 1, 1).setDataValidation(listRule_(COMPANY_TYPES));
  sh.getRange(2, COLS.COMPANIES.status,          lastRow - 1, 1).setDataValidation(listRule_(COMPANY_STATUSES));
  sh.getRange(2, COLS.COMPANIES.trade_direction, lastRow - 1, 1).setDataValidation(listRule_(TRADE_DIRECTIONS));

  var statusRange = sh.getRange(2, COLS.COMPANIES.status, lastRow - 1, 1);
  sh.setConditionalFormatRules([
    formatRule_(statusRange, 'Active',   '#D9EAD3'),
    formatRule_(statusRange, 'Inactive', '#F4CCCC'),
    formatRule_(statusRange, 'Prospect', '#D9EAF7')
  ]);

  var widths = {};
  widths[COLS.COMPANIES.company_id]      = 220;
  widths[COLS.COMPANIES.name]            = 200;
  widths[COLS.COMPANIES.type]            = 150;
  widths[COLS.COMPANIES.country]         = 120;
  widths[COLS.COMPANIES.city]            = 120;
  widths[COLS.COMPANIES.industry]        = 160;
  widths[COLS.COMPANIES.trade_direction] = 160;
  widths[COLS.COMPANIES.website]         = 220;
  widths[COLS.COMPANIES.email]           = 210;
  widths[COLS.COMPANIES.notes]           = 300;
  Object.keys(widths).forEach(function(col) { sh.setColumnWidth(Number(col), widths[col]); });
  return sh;
}

function setupContactsSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.CONTACTS);
  var sh = setupSheet_(ss, SHEET.CONTACTS, headers);
  sh.setFrozenColumns(2);

  var lastRow = Math.max(sh.getMaxRows(), 1000);
  sh.getRange(2, COLS.CONTACTS.status,     lastRow - 1, 1).setDataValidation(listRule_(CONTACT_STATUSES));
  sh.getRange(2, COLS.CONTACTS.language,   lastRow - 1, 1).setDataValidation(listRule_(LANGUAGES));

  // is_primary is a checkbox column
  sh.getRange(2, COLS.CONTACTS.is_primary, lastRow - 1, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());

  var widths = {};
  widths[COLS.CONTACTS.contact_id] = 220;
  widths[COLS.CONTACTS.company_id] = 220;
  widths[COLS.CONTACTS.full_name]  = 180;
  widths[COLS.CONTACTS.email]      = 210;
  widths[COLS.CONTACTS.title]      = 160;
  Object.keys(widths).forEach(function(col) { sh.setColumnWidth(Number(col), widths[col]); });
  return sh;
}

function setupProjectsSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.PROJECTS);
  var sh = setupSheet_(ss, SHEET.PROJECTS, headers);
  sh.setFrozenColumns(2);

  var lastRow = Math.max(sh.getMaxRows(), 1000);
  sh.getRange(2, COLS.PROJECTS.status,          lastRow - 1, 1).setDataValidation(listRule_(PROJECT_STATUSES));
  sh.getRange(2, COLS.PROJECTS.phase,           lastRow - 1, 1).setDataValidation(listRule_(PROJECT_PHASES));
  sh.getRange(2, COLS.PROJECTS.priority,        lastRow - 1, 1).setDataValidation(listRule_(PRIORITIES));
  sh.getRange(2, COLS.PROJECTS.service_line,    lastRow - 1, 1).setDataValidation(listRule_(SERVICES));
  sh.getRange(2, COLS.PROJECTS.trade_direction, lastRow - 1, 1).setDataValidation(listRule_(TRADE_DIRECTIONS));

  sh.getRange(2, COLS.PROJECTS.start_date,      lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');
  sh.getRange(2, COLS.PROJECTS.target_end_date, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');
  sh.getRange(2, COLS.PROJECTS.actual_end_date, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');

  var statusRange = sh.getRange(2, COLS.PROJECTS.status,   lastRow - 1, 1);
  var priRange    = sh.getRange(2, COLS.PROJECTS.priority,  lastRow - 1, 1);
  sh.setConditionalFormatRules([
    formatRule_(statusRange, 'Active',    '#D9EAD3'),
    formatRule_(statusRange, 'On Hold',   '#FFF2CC'),
    formatRule_(statusRange, 'Completed', '#B6D7A8'),
    formatRule_(statusRange, 'Cancelled', '#F4CCCC'),
    formatRule_(priRange,    'High',      '#F4CCCC'),
    formatRule_(priRange,    'Medium',    '#FFF2CC'),
    formatRule_(priRange,    'Low',       '#D9EAD3')
  ]);

  var widths = {};
  widths[COLS.PROJECTS.project_id]      = 220;
  widths[COLS.PROJECTS.name]            = 220;
  widths[COLS.PROJECTS.service_line]    = 230;
  widths[COLS.PROJECTS.description]     = 300;
  widths[COLS.PROJECTS.company_id]      = 220;
  Object.keys(widths).forEach(function(col) { sh.setColumnWidth(Number(col), widths[col]); });
  return sh;
}

function setupTasksSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.TASKS);
  var sh = setupSheet_(ss, SHEET.TASKS, headers);

  var lastRow = Math.max(sh.getMaxRows(), 1000);
  sh.getRange(2, COLS.TASKS.status,   lastRow - 1, 1).setDataValidation(listRule_(TASK_STATUSES));
  sh.getRange(2, COLS.TASKS.priority, lastRow - 1, 1).setDataValidation(listRule_(PRIORITIES));
  sh.getRange(2, COLS.TASKS.due_date, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');

  var statusRange = sh.getRange(2, COLS.TASKS.status,   lastRow - 1, 1);
  var priRange    = sh.getRange(2, COLS.TASKS.priority,  lastRow - 1, 1);
  sh.setConditionalFormatRules([
    formatRule_(statusRange, 'Open',       '#D9EAF7'),
    formatRule_(statusRange, 'In Progress', '#FFF2CC'),
    formatRule_(statusRange, 'Done',        '#D9EAD3'),
    formatRule_(statusRange, 'Cancelled',   '#D9D9D9'),
    formatRule_(priRange,    'High',        '#F4CCCC'),
    formatRule_(priRange,    'Medium',      '#FFF2CC'),
    formatRule_(priRange,    'Low',         '#D9EAD3')
  ]);

  var widths = {};
  widths[COLS.TASKS.task_id]     = 220;
  widths[COLS.TASKS.title]       = 260;
  widths[COLS.TASKS.description] = 300;
  widths[COLS.TASKS.entity_id]   = 220;
  Object.keys(widths).forEach(function(col) { sh.setColumnWidth(Number(col), widths[col]); });
  return sh;
}

function setupNotesSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.NOTES);
  var sh = setupSheet_(ss, SHEET.NOTES, headers);
  sh.getRange(2, COLS.NOTES.content, Math.max(sh.getMaxRows(), 1000) - 1, 1).setWrap(true);

  var widths = {};
  widths[COLS.NOTES.note_id]       = 220;
  widths[COLS.NOTES.entity_id]     = 220;
  widths[COLS.NOTES.content]       = 400;
  widths[COLS.NOTES.author_user_id] = 220;
  Object.keys(widths).forEach(function(col) { sh.setColumnWidth(Number(col), widths[col]); });
  return sh;
}

function setupActivitiesSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.ACTIVITIES);
  var sh = setupSheet_(ss, SHEET.ACTIVITIES, headers);
  var widths = {};
  widths[COLS.ACTIVITIES.activity_id]  = 220;
  widths[COLS.ACTIVITIES.entity_id]    = 220;
  widths[COLS.ACTIVITIES.summary]      = 300;
  widths[COLS.ACTIVITIES.details]      = 260;
  widths[COLS.ACTIVITIES.performed_by] = 220;
  Object.keys(widths).forEach(function(col) { sh.setColumnWidth(Number(col), widths[col]); });
  return sh;
}

function setupSettingsSheet_(ss) {
  var headers = buildHeadersFromCols_(COLS.SETTINGS);
  var sh = setupSheet_(ss, SHEET.SETTINGS, headers);

  // Only seed if the sheet is empty (don't overwrite user changes)
  if (sh.getLastRow() <= 1) {
    var sortOrder = 0;
    var rows = [];

    LEAD_STATUSES.forEach(function(s) {
      rows.push(['lead_status', s, s, '', ++sortOrder, true, '']);
    });
    PROJECT_STATUSES.forEach(function(s) {
      rows.push(['project_status', s, s, '', ++sortOrder, true, '']);
    });
    PROJECT_PHASES.forEach(function(s) {
      rows.push(['project_phase', s, s, '', ++sortOrder, true, '']);
    });
    TASK_STATUSES.forEach(function(s) {
      rows.push(['task_status', s, s, '', ++sortOrder, true, '']);
    });
    SERVICES.forEach(function(s) {
      rows.push(['service_line', s, s, '', ++sortOrder, true, '']);
    });
    TRADE_DIRECTIONS.forEach(function(s) {
      rows.push(['trade_direction', s, s, '', ++sortOrder, true, '']);
    });

    if (rows.length) {
      sh.getRange(2, 1, rows.length, Object.keys(COLS.SETTINGS).length).setValues(rows);
    }
  }

  sh.setColumnWidth(COLS.SETTINGS.category,    150);
  sh.setColumnWidth(COLS.SETTINGS.key,         200);
  sh.setColumnWidth(COLS.SETTINGS.label,       200);
  sh.setColumnWidth(COLS.SETTINGS.description, 300);
  return sh;
}
