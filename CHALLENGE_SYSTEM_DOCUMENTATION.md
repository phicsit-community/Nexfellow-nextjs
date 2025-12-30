# Challenge System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Backend Architecture](#backend-architecture)
3. [Database Models](#database-models)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Admin Dashboard](#admin-dashboard)
7. [User Experience Flow](#user-experience-flow)
8. [Technical Implementation](#technical-implementation)
9. [Configuration & Settings](#configuration--settings)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

The Challenge System is a comprehensive feature that allows community creators to design and manage multi-day challenges for their community members. The system supports various challenge durations, reward mechanisms, submission tracking, and analytics.

### Key Features
- **Multi-day Challenges**: 7, 30, or 100-day challenges with custom durations
- **Daily Tasks**: Text or image-based submissions for each day
- **Reward System**: Checkpoint-based rewards (badges, points, certificates)
- **Progress Tracking**: Real-time progress monitoring and analytics
- **Admin Dashboard**: Comprehensive management interface for challenge creators
- **Activity Feed**: Detailed activity tracking and history
- **Leaderboard**: Participant ranking and statistics

---

## Backend Architecture

### Core Models

#### 1. Challenge Model (`challengeModel.js`)
The central model representing a challenge with all its configuration and participants.

**Key Fields:**
- `title`: Challenge name (6-255 characters)
- `description`: Detailed description (10-1024 characters)
- `coverImage`: Bunny CDN URL for challenge image
- `duration`: Predefined duration (7, 30, 100 days) or custom
- `startDate`/`endDate`: Challenge timeline
- `status`: unpublished/upcoming/ongoing/completed
- `creator`: Reference to User who created the challenge
- `community`: Reference to Community hosting the challenge

**Nested Schemas:**
- `dailyTasks`: Array of daily task configurations
- `checkpointRewards`: Array of reward configurations
- `participants`: Array of participant progress data
- `settings`: Challenge configuration options

**Methods:**
- `isActive()`: Checks if challenge is currently running
- `calculateProgress(participantId)`: Calculates completion percentage

#### 2. Challenge Activity Model (`challengeActivityModel.js`)
Tracks all user activities within challenges for analytics and history.

**Activity Types:**
- `enrolled`: User joined the challenge
- `submitted`: Daily submission made
- `day_completed`: Day marked as completed
- `challenge_completed`: Full challenge completion
- `reward_earned`: Reward received

**Key Fields:**
- `challenge`: Reference to Challenge
- `user`: Reference to User
- `activityType`: Type of activity performed
- `day`: Day number (for daily activities)
- `submission`: Reference to ChallengeSubmission
- `reward`: Reference to ChallengeReward
- `details`: Additional activity information

#### 3. Challenge Submission Model (`challengeSubmissionModel.js`)
Manages daily submissions from participants.

**Submission Types:**
- `text`: Text-based submissions
- `image`: Image-based submissions

**Status Options:**
- `pending`: Awaiting review
- `approved`: Accepted submission
- `rejected`: Rejected submission
- `needs_revision`: Requires changes

**Key Features:**
- Unique constraint: One submission per user per day per challenge
- Late submission tracking
- Feedback system for rejected submissions
- Review tracking with moderator information

#### 4. Challenge Reward Model (`challengeRewardModel.js`)
Manages reward distribution and tracking.

**Reward Types:**
- `badge`: Achievement badges
- `points`: Point-based rewards
- `certificate`: Completion certificates
- `custom`: Custom reward types

**Status Flow:**
- `pending`: Reward earned but not yet awarded
- `awarded`: Reward has been given
- `claimed`: User has claimed the reward

#### 5. User Model Integration
The User model includes challenge-related fields:
- `joinedChallenges`: Array of Challenge references
- Challenge participation tracking
- Community role management for challenge creation

---

## API Endpoints

### Public Routes (No Authentication)
```javascript
GET /challenge/public                    // Get all public challenges
GET /challenge/public/:challengeId       // Get specific challenge details
GET /challenge/create                    // Challenge creation page info
```

### Authenticated User Routes
```javascript
POST /challenge/enroll/:challengeId      // Enroll in a challenge
POST /challenge/:challengeId/submit/:day // Submit daily task
GET /challenge/:challengeId/progress     // Get user progress
GET /challenge/my/enrolled              // Get user's enrolled challenges
GET /challenge/:challengeId/user/:userId/activity // Get user activity
```

### Community Creator Routes
```javascript
POST /challenge/create                   // Create new challenge
GET /challenge/my/created               // Get creator's challenges
PUT /challenge/:challengeId             // Update challenge
DELETE /challenge/:challengeId          // Delete challenge
PUT /challenge/:challengeId/status      // Update challenge status
GET /challenge/:challengeId/leaderboard // Get challenge leaderboard
```

### Admin Dashboard Routes
```javascript
GET /challenge/:challengeId/analytics   // Get challenge analytics
GET /challenge/:challengeId/submissions // Get submissions for review
PUT /challenge/:challengeId/submissions/:submissionId/review // Review submission
GET /challenge/:challengeId/activity    // Get challenge activity
POST /challenge/:challengeId/rewards    // Assign rewards
GET /challenge/:challengeId/admin/dashboard // Admin dashboard data
POST /challenge/:challengeId/admin/bulk-approve // Bulk approve submissions
POST /challenge/:challengeId/admin/bulk-reject  // Bulk reject submissions
GET /challenge/:challengeId/participants // Get participants list
```

---

## Frontend Components

### 1. Challenge Card (`ChallengeCard.jsx`)
Displays challenge information in a card format.

**Props:**
- `id`: Challenge unique identifier
- `name`: Challenge title
- `date`: Challenge date range
- `status`: Current challenge status
- `participants`: Number of participants
- `isFree`: Free challenge indicator
- `isUnpublished`: Draft status indicator

**Features:**
- Responsive design with hover effects
- Status-based styling
- Participant count display
- Free/paid challenge indicators

### 2. Create Challenge (`CreateChallenge.jsx`)
Main interface for challenge creation and management.

**Key Features:**
- Template-based challenge creation
- Duration selection (7, 30, 100 days or custom)
- Daily task configuration
- Reward system setup
- Challenge settings management

**State Management:**
- `allChallenges`: List of created challenges
- `loading`: Loading state management
- `showPcOnlyModal`: Mobile restriction modal

### 3. Create Challenge Overlay (`CreateChallengeOverlay.jsx`)
Modal interface for detailed challenge configuration.

**Configuration Tabs:**
1. **Basic Info**: Title, description, cover image
2. **Daily Tasks**: Task configuration for each day
3. **Rewards**: Checkpoint reward setup
4. **Settings**: Challenge behavior configuration

**Advanced Features:**
- Task duplication across days
- Bulk task application
- Reward type selection
- Submission type configuration

### 4. Single Challenge (`SingleChallenge.jsx`)
Comprehensive challenge view with multiple sections.

**Component Sections:**
- **Summary**: Challenge overview and statistics
- **Checkpoints**: Daily task timeline and submission
- **Participants**: Leaderboard and participant list
- **Activity Feed**: Real-time activity tracking

**Key Features:**
- Progress visualization
- Submission history
- Reward tracking
- Activity timeline

### 5. Admin Challenge Dashboard (`AdminChallengeDashboard.jsx`)
Advanced management interface for challenge creators.

**Dashboard Sections:**
- **Overview**: Challenge statistics and status
- **Submissions**: Review and manage submissions
- **Participants**: Participant management and analytics
- **Activity**: Detailed activity tracking
- **Settings**: Challenge configuration

**Management Features:**
- Bulk submission approval/rejection
- Individual submission review
- Reward assignment
- Challenge status management
- Data export capabilities

---

## Admin Dashboard

### Challenge Management Interface

#### Overview Tab
- Challenge statistics and metrics
- Participant count and completion rates
- Revenue and engagement analytics
- Status management controls

#### Submissions Tab
- Pending submission review
- Bulk approval/rejection tools
- Individual feedback system
- Submission quality metrics

#### Participants Tab
- Participant leaderboard
- Progress tracking
- Reward distribution
- Participant analytics

#### Activity Tab
- Real-time activity feed
- User engagement metrics
- Challenge performance analytics
- Historical data tracking

### Key Features
- **Real-time Updates**: Live data synchronization
- **Bulk Operations**: Efficient mass management
- **Analytics Integration**: Comprehensive reporting
- **Mobile Responsive**: Cross-device compatibility

---

## User Experience Flow

### 1. Challenge Discovery
1. User browses community challenges
2. Views challenge cards with key information
3. Clicks to see detailed challenge information
4. Reviews challenge requirements and rewards

### 2. Challenge Enrollment
1. User clicks "Join Challenge"
2. System validates eligibility
3. User is added to participants list
4. Welcome message and instructions displayed

### 3. Daily Participation
1. User accesses daily task
2. Submits text or image content
3. System processes submission
4. Progress updated in real-time

### 4. Reward Collection
1. User reaches checkpoint
2. System automatically awards reward
3. Notification sent to user
4. Reward displayed in user profile

### 5. Challenge Completion
1. User completes all daily tasks
2. Final reward awarded
3. Certificate generated (if applicable)
4. Achievement shared in community

---

## Technical Implementation

### Backend Architecture

#### Controller Layer (`challengeController.js`)
**Key Functions:**
- `createChallenge()`: Challenge creation with validation
- `enrollInChallenge()`: User enrollment processing
- `submitForDay()`: Daily submission handling
- `getUserProgress()`: Progress calculation and retrieval
- `reviewSubmission()`: Submission review system
- `assignRewards()`: Reward distribution logic

#### Middleware Integration
- `isAuthenticated`: User authentication verification
- `isCommunityCreator`: Community ownership validation
- `isClient`: Client-side access control

#### File Upload Handling
- Multer configuration for image submissions
- Bunny CDN integration for file storage
- Image validation and processing

### Frontend Architecture

#### State Management
- React hooks for local state
- Redux integration for global state
- Real-time updates via WebSocket (if implemented)

#### Component Hierarchy
```
App
├── ChallengeCard (List View)
├── CreateChallenge (Creation Interface)
│   └── CreateChallengeOverlay (Modal)
├── SingleChallenge (Detail View)
│   ├── Summary
│   ├── Checkpoints
│   ├── Participants
│   └── ActivityFeed
└── AdminChallengeDashboard (Management)
    ├── Overview
    ├── Submissions
    ├── Participants
    └── Activity
```

#### Styling System
- CSS Modules for component isolation
- Responsive design with media queries
- Dark mode support
- Consistent design system

---

## Configuration & Settings

### Challenge Settings
```javascript
settings: {
  allowLateSubmissions: false,    // Allow submissions after deadline
  autoApproveSubmissions: false,  // Auto-approve all submissions
  requireApprovalForRewards: true // Manual reward approval
}
```

### Duration Options
- **Predefined**: 7, 30, 100 days
- **Custom**: 1-365 days
- **Flexible**: Dynamic duration based on community needs

### Submission Types
- **Text**: Character-limited text submissions
- **Image**: Image upload with validation
- **Mixed**: Support for both types

### Reward Configuration
- **Badges**: Achievement-based rewards
- **Points**: Numeric reward system
- **Certificates**: Completion certificates
- **Custom**: Community-specific rewards

---

## Troubleshooting

### Common Issues

#### 1. Submission Errors
**Problem**: Users unable to submit daily tasks
**Solution**: 
- Check file upload configuration
- Verify submission type validation
- Ensure user enrollment status

#### 2. Progress Not Updating
**Problem**: Progress not reflecting in real-time
**Solution**:
- Verify activity logging
- Check progress calculation logic
- Ensure database consistency

#### 3. Reward Distribution Issues
**Problem**: Rewards not being awarded automatically
**Solution**:
- Check reward configuration
- Verify checkpoint logic
- Review approval settings

#### 4. Admin Dashboard Loading
**Problem**: Dashboard not loading or showing errors
**Solution**:
- Check authentication status
- Verify community ownership
- Review API endpoint permissions

### Performance Optimization

#### Database Indexes
```javascript
// Challenge queries
challengeSchema.index({ status: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ creator: 1 });
challengeSchema.index({ community: 1 });

// Submission queries
challengeSubmissionSchema.index(
  { user: 1, challenge: 1, day: 1 },
  { unique: true }
);

// Activity queries
challengeActivitySchema.index({ challenge: 1, timestamp: -1 });
challengeActivitySchema.index({ user: 1, activityType: 1 });
```

#### Caching Strategies
- Challenge data caching
- User progress caching
- Activity feed pagination
- Leaderboard caching

### Security Considerations

#### Input Validation
- Challenge title and description length limits
- File upload type and size restrictions
- Submission content validation
- User permission verification

#### Access Control
- Community creator verification
- Challenge ownership validation
- Participant enrollment checks
- Admin dashboard access control

---

## API Documentation

### Request/Response Examples

#### Create Challenge
```javascript
POST /challenge/create
Content-Type: multipart/form-data

{
  "title": "30-Day Coding Challenge",
  "description": "Improve your coding skills...",
  "duration": 30,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "dailyTasks": [...],
  "checkpointRewards": [...],
  "settings": {...}
}

Response: {
  "success": true,
  "challenge": { ... }
}
```

#### Enroll in Challenge
```javascript
POST /challenge/enroll/:challengeId

Response: {
  "success": true,
  "message": "Successfully enrolled in challenge",
  "participant": { ... }
}
```

#### Submit Daily Task
```javascript
POST /challenge/:challengeId/submit/:day
Content-Type: multipart/form-data

{
  "submissionType": "text",
  "content": "Today I learned..."
}

Response: {
  "success": true,
  "submission": { ... }
}
```

### Error Handling
```javascript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common Error Codes:
- `CHALLENGE_NOT_FOUND`
- `USER_NOT_ENROLLED`
- `SUBMISSION_ALREADY_EXISTS`
- `INVALID_SUBMISSION_TYPE`
- `CHALLENGE_NOT_ACTIVE`

---

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Detailed performance metrics
2. **Social Features**: Challenge sharing and collaboration
3. **Mobile App**: Native mobile application
4. **AI Integration**: Automated submission review
5. **Gamification**: Enhanced reward systems

### Technical Improvements
1. **Real-time Updates**: WebSocket integration
2. **Performance**: Advanced caching strategies
3. **Scalability**: Microservices architecture
4. **Security**: Enhanced authentication methods

---

## Conclusion

The Challenge System provides a comprehensive solution for community engagement through structured, multi-day challenges. With robust backend architecture, intuitive frontend interfaces, and comprehensive admin tools, it enables community creators to effectively manage and track participant engagement while providing users with an engaging and rewarding experience.

The system's modular design allows for easy customization and extension, making it suitable for various community types and use cases. The combination of real-time tracking, detailed analytics, and flexible reward systems creates a powerful platform for community building and user engagement. 