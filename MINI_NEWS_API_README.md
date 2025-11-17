# MiniNews API Documentation

This document provides comprehensive information about the MiniNews API endpoints, including authentication requirements and Postman request examples.

## Base URL
```
{{base_url}}/api/mini_news
```

## Authentication
- **Bearer Token**: Include `Authorization: Bearer {{token}}` header for authenticated requests
- **Admin Only**: Some endpoints require admin privileges

---

## Endpoints

### 1. Get All MiniNews (Public)
**GET** `{{base_url}}/api/mini_news/public?page=1&limit=20`

**Authentication**: None required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "totalPages": 8,
  "data": [...]
}
```

### 2. Get MiniNews by Category (Public)
**GET** `{{base_url}}/api/mini_news/category/{{categoryId}}?page=1&limit=20`

**Authentication**: None required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response**:
```json
{
  "success": true,
  "count": 20,
  "total": 45,
  "page": 1,
  "totalPages": 3,
  "data": [...]
}
```

### 3. Get MiniNews by Slug (Public)
**GET** `{{base_url}}/api/mini_news/slug/{{slug}}`

**Authentication**: None required

**Response**:
```json
{
  "success": true,
  "data": {...}
}
```

### 4. Get MiniNews Thumbnail (Public)
**GET** `{{base_url}}/api/mini_news/{{id}}/thumb`

**Authentication**: None required

**Response**: Image binary data

### 5. Get All MiniNews (Authenticated)
**GET** `{{base_url}}/api/mini_news/`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### 6. Get Single MiniNews (Authenticated)
**GET** `{{base_url}}/api/mini_news/{{id}}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "data": {...}
}
```

### 7. Get Deleted MiniNews (Admin Only)
**GET** `{{base_url}}/api/mini_news/deleted`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 8. Create MiniNews (Admin Only)
**POST** `{{base_url}}/api/mini_news/`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

**Form Data**:
- **page**: string (required)
- **category**: string (required)
- **slug**: string (required, unique)
- **tag**: string (required)
- **title**: string (required)
- **excerpt**: string (required)
- **date**: string (required)
- **time**: string (required)
- **paragraphs**: array of strings
- **videoUrl**: string
- **thumb**: file (image)

**Response**:
```json
{
  "success": true,
  "message": "MiniNews article created successfully",
  "data": {...}
}
```

### 9. Update MiniNews (Admin Only)
**PUT** `{{base_url}}/api/mini_news/{{id}}`

**Headers**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body** (JSON - only include fields to update):
```json
{
  "title": "Updated Title",
  "excerpt": "Updated excerpt",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "MiniNews article updated successfully",
  "data": {...}
}
```

### 10. Delete MiniNews (Soft Delete - Admin Only)
**DELETE** `{{base_url}}/api/mini_news/{{id}}`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "message": "MiniNews article deleted successfully"
}
```

### 11. Hard Delete MiniNews (Permanent - Admin Only)
**DELETE** `{{base_url}}/api/mini_news/{{id}}/hard`

**Headers**:
```
Authorization: Bearer {{token}}
```

**Response**:
```json
{
  "success": true,
  "message": "MiniNews article permanently deleted successfully"
}
```

---

## Data Model

The MiniNews model has the following fields (same as News model):

```javascript
{
  page: String,           // required
  category: String,       // required
  slug: String,           // required, unique
  thumb: {                // thumbnail image
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    data: Buffer,
    uploadedAt: Date
  },
  tag: String,            // required
  title: String,          // required
  excerpt: String,        // required
  date: String,           // required
  time: String,           // required
  paragraphs: [String],   // array of strings
  videoUrl: String,
  isActive: Boolean,      // default: true
  createdAt: Date,        // auto-generated
  updatedAt: Date         // auto-generated
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors, duplicate slugs)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (admin access required)
- **404**: Not Found
- **500**: Internal Server Error

---

## Postman Collection

Import this collection into Postman and set the following variables:
- **base_url**: Your API base URL (e.g., `http://localhost:5000`)
- **token**: Your authentication token

## Notes

- File uploads are limited to 5MB per file
- Maximum 1 file per upload (thumbnail only)
- Only image files are accepted for uploads
- Soft delete sets `isActive` to `false` instead of removing the record
- Public endpoints don't require authentication but may have limited data access
- Admin endpoints require both authentication and admin privileges
