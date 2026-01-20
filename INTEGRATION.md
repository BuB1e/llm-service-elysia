# LLM Service - Integration Guide

Instructions for integrating the LLM Service with your backend.

## Base URL

```
Development: http://localhost:3000
Production:  https://your-llm-service.example.com
```

## Authentication

Add the API key to your request headers:

```
Authorization: Bearer YOUR_API_KEY
```

> **Note**: Get the API key from the LLM service's `.env` file (`API_KEYS` variable).

---

## Endpoints

### Health Check

```http
GET /api/health
```

**Response:**

```json
{ "status": "ok", "service": "llm-service" }
```

> No authentication required.

---

### Analyze Control

```http
POST /api/analyze-control
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**

| Field             | Type    | Required | Description                    |
| ----------------- | ------- | -------- | ------------------------------ |
| `controlCode`     | string  | ✅       | e.g., "A.5.1"                  |
| `title`           | string  | ✅       | Control title                  |
| `description`     | string  | ✅       | Control description            |
| `guidance`        | string  | ✅       | ISO 27001 guidance             |
| `status`          | string  | ✅       | Current status                 |
| `currentPractice` | string  | ✅       | What's currently implemented   |
| `evidenceSummary` | string  | ✅       | Available evidence             |
| `context`         | string  | ✅       | Company context                |
| `testmode`        | boolean | ❌       | If true, tests connection only |

**Example Request:**

```json
{
  "controlCode": "A.5.1",
  "title": "Policies for information security",
  "description": "Information security policy shall be defined...",
  "guidance": "Top management should approve the policy...",
  "status": "Partial",
  "currentPractice": "We have a basic security policy document",
  "evidenceSummary": "Policy document v1.0, last updated 2024",
  "context": "Mid-size tech company, 50 employees"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "aiSuggestion": "## Gap Analysis\n..."
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized: Invalid or missing API key"
}
```

**Rate Limit Response (429):**

```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

---

## Code Examples

### TypeScript/JavaScript (fetch)

```typescript
const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL;
const LLM_API_KEY = process.env.LLM_SERVICE_API_KEY;

async function analyzeControl(control: ControlData) {
  const response = await fetch(`${LLM_SERVICE_URL}/api/analyze-control`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      controlCode: control.code,
      title: control.title,
      description: control.description,
      guidance: control.guidance,
      status: control.status,
      currentPractice: control.currentPractice,
      evidenceSummary: control.evidenceSummary,
      context: "Your company context here",
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM Service error: ${response.status}`);
  }

  const result = await response.json();
  return result.data.aiSuggestion;
}
```

### Environment Variables (your backend)

```env
LLM_SERVICE_URL=http://localhost:3000
LLM_SERVICE_API_KEY=your-shared-secret-key
```

---

## Rate Limits

| Limit               | Default |
| ------------------- | ------- |
| Requests per minute | 30      |

Check response headers:

- `X-RateLimit-Limit` - Max requests
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Unix timestamp when limit resets
