# Challenge System API Documentation

## Overview

The refactored Challenge System allows community creators to create daily challenges that participants can enroll in and submit to daily. The system supports both text and image submissions with a robust review system.

## Key Features

- **Duration-based Challenges**: 7, 30, 100 days or custom duration
- **Daily Tasks**: Each day has its own task and submission requirement
- **Review System**: Creators can review and approve/reject submissions
- **Checkpoint Rewards**: Configurable rewards at specific days
- **Progress Tracking**: Detailed progress tracking for participants
- **Activity Feed**: Real-time activity tracking for creators

## Models

### Challenge Schema
```javascript
{
  title: String,
  description: String,
  duration: Number, // 7, 30, 100
  customDuration: Number, // if custom
  startDate: Date,
  endDate: Date,
  status: ['unpublished', 'upcoming', 'ongoing', 'completed'],
  creator: ObjectId, // User with isCommunityAccount = true
  community: ObjectId,
  coverImage: String, // Bunny CDN URL
  dailyTasks: [{
    day: Number,
    title: String,
    description: String,
    submissionType: ['text', 'image'],
    submissionPrompt: String
  }],
  checkpointRewards: [{
    checkpointDay: Number,
    rewardType: ['badge', 'points', 'certificate', 'custom'],
    rewardValue: String,
    rewardDescription: String
  }],
  participants: [{
    user: ObjectId,
    enrolledAt: Date,
    currentDay: Number,
    completedDays: [Number],
    progress: Number, // 0-100
    earnedRewards: Array,
    isCompleted: Boolean,
    completedAt: Date
  }],
  settings: {
    allowLateSubmissions: Boolean,
    autoApproveSubmissions: Boolean,
    requireApprovalForRewards: Boolean
  }
}
```

## API Endpoints

### Public Routes

#### GET /challenges/public
Get all published challenges with pagination
- Query params: `status`, `page`, `limit`
- Response: Array of challenges with pagination info

#### GET /challenges/public/:challengeId
Get challenge details (public view)
- No sensitive participant data included

### User Routes (Authenticated)

#### POST /challenges/enroll/:challengeId
Enroll in a challenge
- Auth required
- Creates participant entry

#### POST /challenges/:challengeId/submit/:day
Submit for a specific day
- Auth required
- Supports multipart/form-data for images
- Body: `content` (for text submissions)
- File: `image` (for image submissions)

#### GET /challenges/:challengeId/progress
Get user's progress in a challenge
- Auth required
- Returns submissions, rewards, and stats

#### GET /challenges/my/enrolled
Get challenges user is enrolled in
- Auth required
- Query params: `page`, `limit`, `status`

### Creator Routes (Community Creators Only)

#### POST /challenges/create
Create a new challenge
- Auth: isCommunityCreator
- Supports multipart/form-data for cover image
- Body: Challenge data including dailyTasks and checkpointRewards

#### GET /challenges/my/created
Get challenges created by user
- Auth: isCommunityCreator
- Query params: `page`, `limit`, `status`

#### PUT /challenges/:challengeId
Update challenge details
- Auth: isCommunityCreator + ownership
- Supports cover image update
- Cannot modify core fields if challenge is ongoing

#### DELETE /challenges/:challengeId
Delete a challenge
- Auth: isCommunityCreator + ownership
- Cannot delete ongoing challenges
- Removes all related data

#### PUT /challenges/:challengeId/status
Update challenge status
- Auth: isCommunityCreator + ownership
- Body: `{ status: "unpublished|upcoming|ongoing|completed" }`

### Creator Dashboard Routes

#### GET /challenges/:challengeId/analytics
Get challenge analytics
- Auth: isCommunityCreator + ownership
- Returns participation stats, submission counts, progress data

#### GET /challenges/:challengeId/submissions
Get submissions for review
- Auth: isCommunityCreator + ownership
- Query params: `day`, `status`, `page`, `limit`
- Returns submissions with user info

#### PUT /challenges/:challengeId/submissions/:submissionId/review
Review a submission
- Auth: isCommunityCreator + ownership
- Body: `{ status: "approved|rejected|needs_revision", comment: "..." }`
- Auto-awards checkpoint rewards on approval

#### GET /challenges/:challengeId/activity
Get challenge activity feed
- Auth: isCommunityCreator + ownership
- Query params: `page`, `limit`
- Returns chronological activity log

## Example Usage

### Creating a Challenge
```javascript
POST /challenges/create
Content-Type: multipart/form-data

{
  "title": "30-Day Fitness Challenge",
  "description": "Transform your fitness in 30 days",
  "duration": 30,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-02-15T23:59:59.999Z",
  "communityId": "community123",
  "dailyTasks": [
    {
      "day": 1,
      "title": "Day 1: Starting Strong",
      "description": "Complete a 20-minute walk",
      "submissionType": "image",
      "submissionPrompt": "Share a photo of your workout or the route you walked"
    }
  ],
  "checkpointRewards": [
    {
      "checkpointDay": 7,
      "rewardType": "badge",
      "rewardValue": "Week 1 Champion",
      "rewardDescription": "Completed your first week!"
    }
  ]
}
```

### Enrolling in a Challenge
```javascript
POST /challenges/enroll/challenge123
Authorization: Bearer <token>
```

### Submitting for a Day (Text)
```javascript
POST /challenges/challenge123/submit/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Completed my 20-minute walk today! Feeling energized and ready for tomorrow."
}
```

### Submitting for a Day (Image)
```javascript
POST /challenges/challenge123/submit/1
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

### Reviewing a Submission
```javascript
PUT /challenges/challenge123/submissions/submission456/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "comment": "Great job! Keep up the momentum!"
}
```

## Database Changes

The refactoring includes:
1. **Simplified Challenge Model**: Removed legacy fields and complex checkpoint system
2. **Daily Task Structure**: Built into challenge model for better performance
3. **Streamlined Submissions**: One submission per user per day per challenge
4. **Improved Rewards**: Checkpoint-based rewards with automatic awarding
5. **Activity Logging**: Comprehensive activity tracking for creators

## Security Considerations

- Only users with `isCommunityAccount = true` can create challenges
- Creators can only create challenges for their own communities
- File uploads are processed through Bunny CDN
- Comprehensive authorization checks on all creator routes
- Input validation and sanitization on all endpoints
