# Challenge API Documentation

## Challenge Endpoints

### General Challenge Routes

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
GET /challenge/:challengeId/details
```
Retrieves detailed information about a specific challenge.

**Parameters:**
- `challengeId`: ID of the challenge to retrieve

**Response:**
```json
{
  "challenge": {
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
        "user": {
          "_id": "user_id",
          "username": "username",
          "picture": "profile_picture_url"
        },
        "joinedAt": "2023-01-01T00:00:00.000Z",
        "progress": 50,
        "completedCheckpoints": []
      }
    ]
  }
}
```

#### Join Challenge
```
POST /challenge/:challengeId/join
```
Allows a user to join a challenge.

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

#### Submit Checkpoint
```
POST /challenge/:challengeId/submit
```
Submit work for a checkpoint in a challenge.

**Parameters:**
- `challengeId`: ID of the challenge

**Request Body:**
```json
{
  "checkpointId": "checkpoint_id",
  "submissionType": "text",
  "content": "Submission content",
  "attachments": ["url1", "url2"]
}
```

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Submission added successfully",
  "submission": {
    "_id": "submission_id",
    "challenge": "challenge_id",
    "checkpoint": "checkpoint_id",
    "user": "user_id",
    "submissionType": "text",
    "content": "Submission content",
    "attachments": ["url1", "url2"],
    "status": "pending",
    "submittedAt": "2023-01-15T00:00:00.000Z"
  }
}
```

### Admin Dashboard Routes

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

**Request Body:**
```json
{
  "status": "approved",
  "rating": 5,
  "comment": "Great work!"
}
```

**Authentication Required:** Yes (admin only)

**Response:**
```json
{
  "message": "Submission reviewed successfully",
  "submission": {
    "_id": "submission_id",
    "status": "approved",
    "rating": 5,
    "feedback": "Great work!"
  }
}
```

#### Reward Participant
```
POST /challenge/:challengeId/reward
```
Award a reward to a challenge participant.

**Parameters:**
- `challengeId`: ID of the challenge

**Request Body:**
```json
{
  "userId": "user_id",
  "rewardType": "badge",
  "rewardValue": "CHALLENGE_MASTER",
  "points": 100,
  "message": "Congratulations on completing the challenge!"
}
```

**Authentication Required:** Yes (admin only)

**Response:**
```json
{
  "message": "Reward assigned successfully",
  "reward": {
    "_id": "reward_id",
    "challenge": "challenge_id",
    "user": "user_id",
    "rewardType": "badge",
    "rewardValue": "CHALLENGE_MASTER",
    "points": 100,
    "message": "Congratulations on completing the challenge!",
    "awardedAt": "2023-01-30T00:00:00.000Z"
  }
}
```

#### Get Challenge Analytics
```
GET /challenge/:challengeId/analytics
```
Get analytics data for a challenge (admin only).

**Parameters:**
- `challengeId`: ID of the challenge

**Authentication Required:** Yes (admin only)

**Response:**
```json
{
  "participation": {
    "totalParticipants": 100,
    "completedCount": 75,
    "completionRate": 75,
    "averageProgress": 82.5
  },
  "checkpointCompletion": [
    {
      "checkpointId": "checkpoint_id",
      "title": "Checkpoint 1",
      "completionCount": 90,
      "completionRate": 90
    }
  ],
  "submissions": {
    "total": 350,
    "pending": 25,
    "approved": 300,
    "rejected": 15,
    "needsRevision": 10
  },
  "dailyActivity": [
    {
      "date": "2023-01-01",
      "joins": 10,
      "submissions": 5,
      "completions": 0
    }
  ]
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error message explaining what went wrong",
  "error": "Optional technical error details"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Server Error (unexpected issues)

## Validation

Challenge-related endpoints implement validation for:
1. Required fields (title, description, dates)
2. Date constraints (start date must be before end date)
3. Field length limits (title, descriptions)
4. Valid checkpoint configuration
5. Proper submission formats
6. Valid ratings (1-5)
7. Valid reward types and values
