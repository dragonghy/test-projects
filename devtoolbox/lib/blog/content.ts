// Blog article content stored as markdown strings
// Each article is 800-1200 words with code examples and CTA

export const articleContent: Record<string, string> = {
  "json-formatting-guide": `
## What Is JSON?

JSON (JavaScript Object Notation) is the most widely used data interchange format on the web. APIs, configuration files, databases — JSON is everywhere. But raw JSON can be hard to read, especially when it's minified or deeply nested.

## Pretty-Printing JSON

Pretty-printing adds indentation and line breaks to make JSON human-readable. In JavaScript, \`JSON.stringify()\` does this:

\`\`\`javascript
const data = {"name":"John","age":30,"address":{"city":"NYC","zip":"10001"}};

// Pretty-print with 2-space indentation
const formatted = JSON.stringify(data, null, 2);
console.log(formatted);
\`\`\`

Output:
\`\`\`json
{
  "name": "John",
  "age": 30,
  "address": {
    "city": "NYC",
    "zip": "10001"
  }
}
\`\`\`

The third argument to \`JSON.stringify()\` controls indentation — use \`2\` for two spaces or \`"\\t"\` for tabs.

## Minifying JSON

Minification removes all unnecessary whitespace, reducing file size for production use:

\`\`\`javascript
const minified = JSON.stringify(JSON.parse(formattedJson));
// {"name":"John","age":30,"address":{"city":"NYC","zip":"10001"}}
\`\`\`

This is useful when sending JSON over HTTP — smaller payloads mean faster transfers.

## Validating JSON

Common JSON errors include:
- **Trailing commas**: \`{"a": 1,}\` — not valid in JSON (but valid in JavaScript)
- **Single quotes**: \`{'name': 'John'}\` — JSON requires double quotes
- **Unquoted keys**: \`{name: "John"}\` — keys must be quoted strings
- **Comments**: \`// comment\` — JSON doesn't support comments

When \`JSON.parse()\` encounters invalid JSON, it throws a SyntaxError with a position indicator:

\`\`\`javascript
try {
  JSON.parse('{"name": "John",}');
} catch (e) {
  console.error(e.message);
  // "Expected double-quoted property name in JSON at position 16"
}
\`\`\`

## JSON in Different Languages

### Python
\`\`\`python
import json

# Pretty-print
print(json.dumps(data, indent=2))

# Validate
try:
    json.loads(json_string)
except json.JSONDecodeError as e:
    print(f"Invalid JSON: {e}")
\`\`\`

### Command Line
\`\`\`bash
# Format with jq
echo '{"name":"John"}' | jq .

# Python one-liner
echo '{"name":"John"}' | python3 -m json.tool
\`\`\`

## Best Practices

1. **Always validate** JSON from external sources before processing
2. **Use 2-space indentation** for readability (most style guides agree)
3. **Minify for production** — save bandwidth on API responses
4. **Use a linter** to catch issues early in development
5. **Prefer JSON5** or JSONC for config files that need comments

## When to Use an Online Formatter

Online JSON formatters are invaluable when you need to quickly inspect an API response, debug a configuration file, or share formatted data with a colleague. No installation required — just paste and go.
`,

  "regex-cheat-sheet": `
## What Are Regular Expressions?

Regular expressions (regex) are patterns used to match character combinations in strings. They're essential for text searching, validation, and data extraction across all programming languages.

## Basic Syntax

| Pattern | Matches | Example |
|---------|---------|---------|
| \`.\` | Any single character | \`a.c\` matches "abc", "a1c" |
| \`\\d\` | Any digit (0-9) | \`\\d{3}\` matches "123" |
| \`\\w\` | Any word character (a-z, A-Z, 0-9, _) | \`\\w+\` matches "hello_world" |
| \`\\s\` | Any whitespace | \`\\s+\` matches spaces, tabs |
| \`^\` | Start of string | \`^Hello\` matches "Hello world" |
| \`$\` | End of string | \`world$\` matches "Hello world" |

## Quantifiers

\`\`\`
*     Zero or more     \\d*       matches "", "1", "123"
+     One or more      \\d+       matches "1", "123" (not "")
?     Zero or one      colou?r   matches "color", "colour"
{3}   Exactly 3        \\d{3}     matches "123"
{2,5} Between 2 and 5  \\w{2,5}   matches "ab", "abcde"
\`\`\`

## Character Classes

\`\`\`javascript
[abc]     // Matches a, b, or c
[a-z]     // Matches any lowercase letter
[^abc]    // Matches anything except a, b, c
[0-9a-f]  // Matches hex digits
\`\`\`

## Groups and Capturing

\`\`\`javascript
const regex = /(\\d{4})-(\\d{2})-(\\d{2})/;
const match = "2024-03-15".match(regex);
// match[1] = "2024" (year)
// match[2] = "03"   (month)
// match[3] = "15"   (day)
\`\`\`

Named groups make code more readable:
\`\`\`javascript
const regex = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
const { groups } = "2024-03-15".match(regex);
// groups.year = "2024"
\`\`\`

## Common Patterns

### Email Validation
\`\`\`javascript
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/
\`\`\`

### URL Matching
\`\`\`javascript
/https?:\\/\\/[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*/
\`\`\`

### Phone Number (US)
\`\`\`javascript
/^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$/
\`\`\`

### Password Strength
\`\`\`javascript
// At least 8 chars, 1 uppercase, 1 lowercase, 1 digit
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/
\`\`\`

## Flags

| Flag | Name | Effect |
|------|------|--------|
| \`g\` | Global | Find all matches, not just the first |
| \`i\` | Case-insensitive | Ignore upper/lowercase |
| \`m\` | Multiline | \`^\` and \`$\` match line boundaries |
| \`s\` | DotAll | \`.\` matches newline characters |

## Performance Tips

1. **Be specific** — \`\\d{3}\` is faster than \`\\d+\` when you know the length
2. **Avoid catastrophic backtracking** — nested quantifiers like \`(a+)+\` can freeze
3. **Use non-capturing groups** \`(?:...)\` when you don't need the match
4. **Anchor your patterns** — \`^\\d+$\` is faster than \`\\d+\` for full-string matching
`,

  "understanding-jwt-tokens": `
## What Is a JWT?

A JSON Web Token (JWT) is a compact, URL-safe token format used for securely transmitting information between parties. JWTs are the backbone of modern authentication in web applications and APIs.

## JWT Structure

A JWT consists of three parts separated by dots:

\`\`\`
header.payload.signature
\`\`\`

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

### Header
The header typically contains two fields:
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`
- \`alg\`: The signing algorithm (HS256, RS256, ES256)
- \`typ\`: Token type (always "JWT")

### Payload (Claims)
The payload contains the claims — statements about the user and metadata:
\`\`\`json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "iat": 1710000000,
  "exp": 1710086400
}
\`\`\`

**Registered claims** (standardized):
- \`iss\` — Issuer
- \`sub\` — Subject (user ID)
- \`exp\` — Expiration time (Unix timestamp)
- \`iat\` — Issued at
- \`nbf\` — Not before

### Signature
The signature verifies the token hasn't been tampered with:
\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`

## Decoding vs. Verifying

**Decoding** is reading the header and payload — anyone can do this because they're just Base64-encoded (not encrypted!).

**Verifying** checks the signature using the secret key — this proves the token is authentic and unmodified.

\`\`\`javascript
// Decode (no secret needed)
const payload = JSON.parse(atob(token.split('.')[1]));

// Verify (requires secret)
const jwt = require('jsonwebtoken');
const decoded = jwt.verify(token, 'your-secret-key');
\`\`\`

## Common JWT Pitfalls

1. **JWTs are NOT encrypted** — Don't put sensitive data in the payload
2. **Set expiration times** — Tokens without \`exp\` never expire
3. **Keep secrets safe** — A leaked secret means anyone can forge tokens
4. **Use HTTPS** — JWTs in transit should always be encrypted
5. **Don't store in localStorage** — Use httpOnly cookies for XSS protection

## Debugging JWTs

When a JWT-authenticated request fails, check:
1. Is the token expired? Compare \`exp\` with current time
2. Is the algorithm correct? Mismatched algorithms cause signature failures
3. Are required claims present? Missing \`sub\` or \`role\` may cause authorization errors
`,

  "unix-timestamps-explained": `
## What Is a Unix Timestamp?

A Unix timestamp (also called epoch time or POSIX time) counts the number of seconds since January 1, 1970, 00:00:00 UTC — known as the Unix epoch. It's the universal way computers represent time.

\`\`\`
1710000000 = March 9, 2024, 16:00:00 UTC
\`\`\`

## Why Use Unix Timestamps?

1. **Language-agnostic** — Every programming language can work with them
2. **Timezone-independent** — Always UTC, no timezone confusion
3. **Easy math** — Adding 86400 always means "one day later"
4. **Compact** — A 10-digit number vs. a 24-character date string
5. **Sortable** — Numeric comparison is faster than date parsing

## Converting in Different Languages

### JavaScript
\`\`\`javascript
// Current timestamp (seconds)
const now = Math.floor(Date.now() / 1000);

// Timestamp to Date
const date = new Date(1710000000 * 1000);
console.log(date.toISOString()); // "2024-03-09T16:00:00.000Z"

// Date to Timestamp
const ts = Math.floor(new Date("2024-03-09").getTime() / 1000);
\`\`\`

### Python
\`\`\`python
import time, datetime

# Current timestamp
now = int(time.time())

# Timestamp to datetime
dt = datetime.datetime.fromtimestamp(1710000000)

# Datetime to timestamp
ts = int(dt.timestamp())
\`\`\`

### Bash
\`\`\`bash
# Current timestamp
date +%s

# Timestamp to date
date -d @1710000000

# Date to timestamp
date -d "2024-03-09" +%s
\`\`\`

## Seconds vs. Milliseconds

JavaScript's \`Date.now()\` returns **milliseconds** (13 digits), while most backend systems use **seconds** (10 digits):

\`\`\`javascript
Date.now()              // 1710000000000 (milliseconds)
Math.floor(Date.now() / 1000)  // 1710000000 (seconds)
\`\`\`

Always check which unit an API expects — using milliseconds where seconds are expected gives you a date in the year 56,000!

## The Year 2038 Problem

32-bit systems store timestamps as signed integers, maxing out at 2,147,483,647 (January 19, 2038, 03:14:07 UTC). After this, the counter overflows to negative, jumping back to 1901. Modern 64-bit systems don't have this issue — they can handle dates until the year 292 billion.

## Common Gotchas

1. **Timezone confusion** — Timestamps are always UTC. Display conversion depends on the user's timezone.
2. **Daylight Saving Time** — Timestamps handle DST correctly since they're UTC-based
3. **Leap seconds** — Unix time ignores leap seconds (each day is exactly 86,400 seconds)
`,

  "base64-encoding-explained": `
## What Is Base64?

Base64 is an encoding scheme that converts binary data into ASCII text using 64 printable characters (A-Z, a-z, 0-9, +, /). It's designed for safely transmitting binary data through text-based systems.

## How Base64 Works

The algorithm takes 3 bytes (24 bits) of input and converts them into 4 Base64 characters (6 bits each):

\`\`\`
Input:  "Hi"
Binary: 01001000 01101001
Base64: S  G  k  =
\`\`\`

The \`=\` padding ensures the output length is always a multiple of 4.

## Common Use Cases

### 1. Data URIs
Embed images directly in HTML or CSS without separate HTTP requests:
\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgo..." />
\`\`\`

### 2. API Authentication
HTTP Basic Authentication encodes \`username:password\` in Base64:
\`\`\`http
Authorization: Basic am9objpwYXNzd29yZA==
\`\`\`

### 3. Email Attachments
MIME encoding uses Base64 to embed binary files in email:
\`\`\`
Content-Transfer-Encoding: base64
\`\`\`

### 4. JSON Payloads
When APIs need to accept binary data in JSON:
\`\`\`json
{
  "file": "SGVsbG8gV29ybGQ=",
  "filename": "hello.txt"
}
\`\`\`

## Encoding in Different Languages

### JavaScript
\`\`\`javascript
// Encode
btoa("Hello World")  // "SGVsbG8gV29ybGQ="

// Decode
atob("SGVsbG8gV29ybGQ=")  // "Hello World"

// Handle Unicode
btoa(unescape(encodeURIComponent("Hello 你好")))
\`\`\`

### Python
\`\`\`python
import base64
encoded = base64.b64encode(b"Hello World").decode()
decoded = base64.b64decode(encoded).decode()
\`\`\`

## Base64 Is NOT Encryption

This is the most common misconception. Base64 is **encoding** (reversible by anyone), not **encryption** (requires a key). Never use Base64 to "hide" sensitive data — it provides zero security.

## Size Overhead

Base64 increases data size by approximately 33% — 3 bytes become 4 characters. For large files, this overhead adds up. That's why Base64-encoded images are best for small icons and logos, not large photos.
`,

  "cron-expression-syntax": `
## What Is Cron?

Cron is a time-based job scheduler in Unix-like operating systems. It uses a compact expression format to define when tasks should run — from "every minute" to "at 3:15 AM on the first Monday of March."

## The 5-Field Format

A standard cron expression has five fields separated by spaces:

\`\`\`
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
\`\`\`

## Special Characters

| Character | Meaning | Example |
|-----------|---------|---------|
| \`*\` | Any value | \`* * * * *\` = every minute |
| \`,\` | List | \`1,15 * * * *\` = minute 1 and 15 |
| \`-\` | Range | \`1-5 * * * *\` = minutes 1 through 5 |
| \`/\` | Step | \`*/15 * * * *\` = every 15 minutes |

## Common Patterns

\`\`\`bash
# Every minute
* * * * *

# Every hour (at minute 0)
0 * * * *

# Every day at midnight
0 0 * * *

# Every day at 3:00 AM
0 3 * * *

# Every Monday at 9:00 AM
0 9 * * 1

# Every weekday at 8:30 AM
30 8 * * 1-5

# First day of every month at midnight
0 0 1 * *

# Every 15 minutes
*/15 * * * *

# Every 6 hours
0 */6 * * *

# Twice a day (8 AM and 8 PM)
0 8,20 * * *
\`\`\`

## Setting Up Cron Jobs

### Linux/macOS
\`\`\`bash
# Edit your crontab
crontab -e

# Add a job
0 3 * * * /path/to/backup.sh

# List all jobs
crontab -l
\`\`\`

### Common Cron Tasks
\`\`\`bash
# Database backup at 2 AM daily
0 2 * * * pg_dump mydb > /backups/db_$(date +\\%Y\\%m\\%d).sql

# Clear temp files every Sunday at 4 AM
0 4 * * 0 rm -rf /tmp/cache/*

# Health check every 5 minutes
*/5 * * * * curl -s https://myapp.com/health > /dev/null
\`\`\`

## Debugging Tips

1. **Check timezone** — Cron uses the system timezone, not UTC (usually)
2. **Use full paths** — Cron doesn't load your shell profile
3. **Redirect output** — Add \`>> /var/log/myjob.log 2>&1\` for debugging
4. **Test with short intervals** — Use \`* * * * *\` first, then adjust
5. **Check permissions** — Scripts must be executable (\`chmod +x\`)
`,

  "sql-formatting-best-practices": `
## Why Format SQL?

Unformatted SQL is hard to read, debug, and maintain. Compare:

**Bad:**
\`\`\`sql
SELECT u.id,u.name,o.total,p.name as product FROM users u INNER JOIN orders o ON u.id=o.user_id INNER JOIN products p ON o.product_id=p.id WHERE o.total>100 AND u.active=true ORDER BY o.total DESC LIMIT 10;
\`\`\`

**Good:**
\`\`\`sql
SELECT
  u.id,
  u.name,
  o.total,
  p.name AS product
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN products p ON o.product_id = p.id
WHERE o.total > 100
  AND u.active = true
ORDER BY o.total DESC
LIMIT 10;
\`\`\`

## Core Formatting Rules

### 1. Uppercase Keywords
SQL keywords should be UPPERCASE to distinguish them from identifiers:
\`\`\`sql
SELECT name FROM users WHERE active = TRUE;
\`\`\`

### 2. One Clause Per Line
Major clauses (SELECT, FROM, WHERE, etc.) start on new lines:
\`\`\`sql
SELECT name, email
FROM users
WHERE active = true
ORDER BY name;
\`\`\`

### 3. Indent Continuation Lines
\`\`\`sql
SELECT
  u.name,
  u.email,
  COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o
  ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
  AND u.active = true
GROUP BY u.name, u.email
HAVING COUNT(o.id) > 5;
\`\`\`

### 4. Align JOINs
\`\`\`sql
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN products p ON o.product_id = p.id
LEFT JOIN reviews r ON p.id = r.product_id
\`\`\`

## Subquery Formatting

\`\`\`sql
SELECT name
FROM users
WHERE id IN (
  SELECT user_id
  FROM orders
  WHERE total > 1000
    AND created_at > '2024-01-01'
);
\`\`\`

## CTE (Common Table Expression) Formatting

\`\`\`sql
WITH high_value_users AS (
  SELECT user_id, SUM(total) AS lifetime_value
  FROM orders
  GROUP BY user_id
  HAVING SUM(total) > 10000
),
recent_orders AS (
  SELECT user_id, MAX(created_at) AS last_order
  FROM orders
  GROUP BY user_id
)
SELECT
  u.name,
  h.lifetime_value,
  r.last_order
FROM users u
INNER JOIN high_value_users h ON u.id = h.user_id
INNER JOIN recent_orders r ON u.id = r.user_id
ORDER BY h.lifetime_value DESC;
\`\`\`

## Style Guides

Different teams follow different standards:
- **Leading commas**: Some prefer commas at the start of lines for easy commenting
- **Tab vs. spaces**: Most guides recommend 2 or 4 spaces
- **Trailing semicolons**: Always include them for clarity

The most important rule: **be consistent** within your team and codebase.
`,

  "http-status-codes-guide": `
## What Are HTTP Status Codes?

Every HTTP response includes a three-digit status code that tells the client what happened with their request. Understanding these codes is essential for building and debugging web applications and APIs.

## 1xx — Informational

These codes indicate the request was received and processing continues.

**100 Continue** — The server received the request headers. The client should send the body. Used with the \`Expect: 100-continue\` header for large uploads.

**101 Switching Protocols** — The server is switching to a different protocol, typically WebSocket:
\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
\`\`\`

## 2xx — Success

The request was successfully received, understood, and accepted.

**200 OK** — The standard success response. The meaning depends on the HTTP method:
- GET: Resource returned in body
- POST: Result of the action in body
- PUT: Updated resource in body

**201 Created** — A new resource was created. Should include a \`Location\` header:
\`\`\`http
HTTP/1.1 201 Created
Location: /api/users/42
\`\`\`

**204 No Content** — Success with no response body. Common for DELETE requests and PUT updates.

## 3xx — Redirection

The client must take additional action to complete the request.

**301 Moved Permanently** — The resource has a new permanent URL. Search engines transfer SEO rank:
\`\`\`http
HTTP/1.1 301 Moved Permanently
Location: https://newdomain.com/page
\`\`\`

**304 Not Modified** — The cached version is still valid. Saves bandwidth:
\`\`\`http
GET /api/data
If-None-Match: "etag-value"

HTTP/1.1 304 Not Modified
\`\`\`

## 4xx — Client Errors

The request contains an error on the client's side.

**400 Bad Request** — The server can't process the request due to client error:
\`\`\`json
{
  "error": "Bad Request",
  "message": "Field 'email' is required"
}
\`\`\`

**401 Unauthorized** — Authentication is required. Despite the name, this means "unauthenticated":
\`\`\`http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
\`\`\`

**403 Forbidden** — The server understood the request but refuses it. The client is authenticated but lacks permissions.

**404 Not Found** — The most famous status code. The resource doesn't exist at this URL.

**429 Too Many Requests** — Rate limiting. Include a \`Retry-After\` header:
\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
\`\`\`

## 5xx — Server Errors

The server failed to fulfill a valid request.

**500 Internal Server Error** — A generic server error. In production, never expose stack traces:
\`\`\`json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
\`\`\`

**502 Bad Gateway** — The server (acting as a proxy) received an invalid response from upstream.

**503 Service Unavailable** — The server is temporarily unavailable (maintenance, overload).

**504 Gateway Timeout** — The upstream server didn't respond in time.

## Best Practices for API Developers

1. **Use specific codes** — Don't return 200 for everything
2. **Include error details** — A JSON body with \`message\` and \`code\` fields
3. **Be consistent** — Use the same codes for the same situations
4. **Document your codes** — List which codes each endpoint can return
5. **Use 429 for rate limiting** — Always include \`Retry-After\`
`,
};
