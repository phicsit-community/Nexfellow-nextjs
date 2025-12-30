# GeeksClash API Documentation

## Challenge API Endpoints

### Challenge Management

#### Get All Challenges
```
GET /challenge/getAllChallenges
```
Returns all available challenges in the system.

**Response:**
```json
{
  "latestChallenges": [
    {
      "_id": "challenge_id",
      "title": "Challenge Title",
      "description": "Challenge Description",
      "startDate": "2023-01-01T00:00:00.000Z",
      "endDate": "2023-01-30T00:00:00.000Z",
      "createdBy": "user_id"
    }
  ]
}
```

#### Get Challenge Details
```
GET /challenge/getChallenge/:challengeid
```
Public route for retrieving challenge details.

**Parameters:**
- `challengeid`: ID of the challenge to retrieve

**Response:**
```json
{
  "_id": "challenge_id",
  "title": "Challenge Title",
  "description": "Challenge Description",
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": "2023-01-30T00:00:00.000Z",
  "createdBy": "user_id",
  "checkpoints": [
    {
      "_id": "checkpoint_id",
      "title": "Checkpoint Title",
      "description": "Checkpoint Description",
      "submissionType": "text",
      "dueDate": "2023-01-15T00:00:00.000Z",
      "order": 1
    }
  ],
  "participants": [
    {
      "user": "user_id",
      "joinedAt": "2023-01-01T00:00:00.000Z",
      "progress": 50
    }
  ]
}
```

#### Get Authenticated Challenge
```
GET /challenge/authenticated/:challengeid
```
Protected route for challenge details with user-specific information.

**Parameters:**
- `challengeid`: ID of the challenge to retrieve

**Authentication Required:** Yes

**Response:** Same as Get Challenge Details

#### Create Challenge
```
POST /challenge/createChallenge
```
Creates a new challenge.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "title": "Challenge Title",
  "description": "Challenge Description",
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": "2023-01-30T00:00:00.000Z",
  "frequency": "daily",
  "checkpoints": [
    {
      "title": "Checkpoint 1",
      "description": "Complete this task",
      "submissionType": "text",
      "dueDate": "2023-01-15T00:00:00.000Z",
      "order": 1
    }
  ],
  "rewards": [
    {
      "title": "First Place",
      "description": "Gold Trophy",
      "value": 100
    }
  ]
}
```

**Response:**
```json
{
  "message": "Challenge created successfully",
  "challenge": {
    "_id": "challenge_id",
    "title": "Challenge Title",
    "description": "Challenge Description",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-30T00:00:00.000Z"
  }
}
```

#### Delete Challenge
```
DELETE /challenge/deleteChallenge/:challengeid
```
Deletes a challenge.

**Parameters:**
- `challengeid`: ID of the challenge to delete

**Authentication Required:** Yes (must be owner or admin)

**Response:**
```json
{
  "message": "Challenge deleted successfully"
}
```

#### Update Challenge
```
PUT /challenge/updateChallenge/:challengeid
```
Updates an existing challenge.

**Parameters:**
- `challengeid`: ID of the challenge to update

**Authentication Required:** Yes (must be owner or admin)

**Request Body:** Same as Create Challenge

**Response:**
```json
{
  "message": "Challenge updated successfully",
  "challenge": {
    "_id": "challenge_id",
    "title": "Updated Challenge Title"
  }
}
```

### Checkpoint Management

#### Update Challenge Checkpoints
```
PUT /challenge/:challengeId/checkpoints
```
Updates checkpoints for a challenge.

**Parameters:**
- `challengeId`: ID of the challenge

**Authentication Required:** Yes (must be owner or admin)

**Request Body:**
```json
{
  "checkpoints": [
    {
      "title": "Updated Checkpoint",
      "description": "Updated description",
      "submissionType": "text",
      "dueDate": "2023-01-15T00:00:00.000Z",
      "order": 1
    }
  ]
}
```

**Response:**
```json
{
  "message": "Checkpoints updated successfully",
  "challenge": {
    "_id": "challenge_id",
    "checkpoints": [
      {
        "_id": "checkpoint_id",
        "title": "Updated Checkpoint"
      }
    ]
  }
}
```

#### Submit Checkpoint
```
POST /challenge/:challengeId/checkpoints/:checkpointId/submit
```
Submit progress for a checkpoint.

**Parameters:**
- `challengeId`: ID of the challenge
- `checkpointId`: ID of the checkpoint

**Authentication Required:** Yes

**Request Body:**
```json
{
  "submissionType": "text",
  "content": "My submission text",
  "attachments": [
    {
      "url": "https://example.com/file.pdf",
      "fileType": "application/pdf",
      "fileName": "submission.pdf"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Checkpoint submission successful",
  "submission": {
    "_id": "submission_id",
    "user": "user_id",
    "challenge": "challenge_id",
    "checkpoint": "checkpoint_id",
    "submissionType": "text",
    "content": "My submission text",
    "attachments": [
      {
        "url": "https://example.com/file.pdf",
        "fileType": "application/pdf",
        "fileName": "submission.pdf"
      }
    ],
    "status": "pending",
    "submittedAt": "2023-01-15T00:00:00.000Z"
  },
  "progress": 25
}
```

### Participant Management

#### Join Challenge
```
POST /challenge/:challengeId/join
```
Joins a user to a challenge.

**Parameters:**
- `challengeId`: ID of the challenge to join

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Successfully joined the challenge",
  "challenge": {
    "_id": "challenge_id",
    "title": "Challenge Title"
  }
}
```

#### Get User Progress
```
GET /challenge/:challengeId/progress/:userId?
```
Gets a user's progress in a challenge. If userId is not provided, uses the authenticated user.

**Parameters:**
- `challengeId`: ID of the challenge
- `userId` (optional): ID of the user to check progress for

**Authentication Required:** Yes

**Response:**
```json
{
  "progress": 50,
  "completedCheckpoints": [
    {
      "checkpoint": "checkpoint_id",
      "completedAt": "2023-01-15T00:00:00.000Z",
      "submission": "submission_id"
    }
  ],
  "pendingCheckpoints": [
    {
      "checkpoint": {
        "_id": "checkpoint_id",
        "title": "Pending Checkpoint",
        "dueDate": "2023-01-20T00:00:00.000Z"
      }
    }
  ]
}
```

#### Get Challenge Leaderboard
```
GET /challenge/:challengeId/leaderboard
```
Gets the leaderboard for a challenge.

**Parameters:**
- `challengeId`: ID of the challenge

**Response:**
```json
{
  "leaderboard": [
    {
      "user": {
        "_id": "user_id",
        "username": "user123",
        "picture": "https://example.com/profile.jpg"
      },
      "progress": 100,
      "completedAt": "2023-01-20T00:00:00.000Z",
      "rank": 1
    }
  ]
}
```

### Admin Dashboard

#### Get Challenge Submissions
```
GET /challenge/:challengeId/submissions
```
Gets all submissions for a challenge (admin only).

**Parameters:**
- `challengeId`: ID of the challenge
- Query parameters:
  - `status`: Filter by submission status (pending, approved, rejected, needs_revision)
  - `startDate`: Filter submissions after this date
  - `endDate`: Filter submissions before this date
  - `limit`: Number of submissions to return (default: 100)
  - `offset`: Pagination offset

**Authentication Required:** Yes (admin only)

**Response:**
```json
{
  "submissions": [
    {
      "_id": "submission_id",
      "user": {
        "_id": "user_id",
        "username": "user123",
        "picture": "https://example.com/profile.jpg"
      },
      "challenge": "challenge_id",
      "checkpoint": "checkpoint_id",
      "submissionType": "text",
      "content": "Submission content",
      "attachments": [],
      "status": "pending",
      "submittedAt": "2023-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Review Submission
```
PUT /challenge/:challengeId/submissions/:submissionId/review
```
Reviews a submission (admin only).

**Parameters:**
- `challengeId`: ID of the challenge
- `submissionId`: ID of the submission

**Authentication Required:** Yes (admin only)

**Request Body:**
```json
{
  "status": "approved",
  "rating": 5,
  "comment": "Great work!"
}
```

**Response:**
```json
{
  "message": "Submission reviewed successfully",
  "submission": {
    "_id": "submission_id",
    "status": "approved",
    "feedback": {
      "rating": 5,
      "comment": "Great work!",
      "reviewedBy": "admin_id",
      "reviewedAt": "2023-01-16T00:00:00.000Z"
    }
  }
}
```

#### Get Challenge Analytics
```
GET /challenge/:challengeId/analytics
```
Gets analytics data for a challenge (admin only).

**Parameters:**
- `challengeId`: ID of the challenge

**Authentication Required:** Yes (admin only)

**Response:**
```json
{
  "participantStats": {
    "totalParticipants": 100,
    "completedCount": 25,
    "completionRate": 25
  },
  "checkpointCompletion": [
    {
      "checkpointId": "checkpoint_id",
      "title": "Checkpoint Title",
      "completionCount": 50,
      "completionRate": 50
    }
  ],
  "submissionStats": {
    "submissionCount": 75,
    "pendingCount": 25,
    "approvedCount": 45,
    "rejectedCount": 5
  },
  "dailyActivity": [
    {
      "date": "2023-01-15",
      "submissionCount": 15,
      "participantCount": 10
    }
  ]
}
```

#### Assign Rewards
```
POST /challenge/:challengeId/rewards
```
Assigns rewards to participants (admin only).

**Parameters:**
- `challengeId`: ID of the challenge

**Authentication Required:** Yes (admin only)

**Request Body:**
```json
{
  "rewards": [
    {
      "user": "user_id",
      "reward": {
        "title": "First Place",
        "description": "Gold Trophy",
        "value": 100
      }
    }
  ]
}
```

**Response:**
```json
{
  "message": "Rewards assigned successfully",
  "rewards": [
    {
      "_id": "reward_id",
      "user": "user_id",
      "challenge": "challenge_id",
      "title": "First Place",
      "assignedAt": "2023-01-30T00:00:00.000Z"
    }
  ]
}
```

### Activity Feed

#### Get Challenge Activity Feed
```
GET /challenge/:challengeId/activity
```
Gets the activity feed for a challenge.

**Parameters:**
- `challengeId`: ID of the challenge
- Query parameters:
  - `limit`: Number of activities to return (default: 20)
  - `offset`: Pagination offset
  - `type`: Filter by activity type

**Authentication Required:** Yes

**Response:**
```json
{
  "activities": [
    {
      "_id": "activity_id",
      "challenge": "challenge_id",
      "user": {
        "_id": "user_id",
        "username": "user123",
        "picture": "https://example.com/profile.jpg"
      },
      "activityType": "checkpoint_complete",
      "checkpoint": "checkpoint_id",
      "details": {
        "progress": 25,
        "message": "Completed checkpoint: Introduction"
      },
      "timestamp": "2023-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Error Handling

All API endpoints follow a standard error handling pattern:

### Success Response
- Status code: 200 or 201
- Body: JSON object with data and/or message

### Error Response
- Status code: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), or 500 (Server Error)
- Body:
```json
{
  "message": "Error message describing what went wrong"
}
```

### Common Error Codes
- 400: Invalid input or request
- 401: Not authenticated
- 403: Not authorized
- 404: Resource not found
- 500: Server error

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT).
Add the JWT token in the HTTP headers:

```
Authorization: Bearer <your_token_here>
```

You can obtain a token by logging in through the `/auth/login` endpoint.
