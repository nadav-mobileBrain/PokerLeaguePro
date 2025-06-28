# PokerLeaguePro - Product Requirements Document

## 1. Executive Summary

PokerLeaguePro is a mobile application designed to track statistics for live cash poker games played among friends. The app enables users to create leagues, record session results, and view comprehensive statistics about players' performance over time. The primary goal is to create a simple yet powerful tool for poker enthusiasts to enhance their home game experience without the complexity of tracking every hand or play.

## 2. Product Overview

### 2.1 Problem Statement

Poker players who organize regular cash games with friends lack an easy way to track long-term performance metrics and league statistics. Current solutions are either too complex (requiring hand-by-hand tracking) or too simple (basic spreadsheets).

### 2.2 Target Audience

- Primary: Recreational poker players who host or participate in regular home cash games
- Secondary: Small poker clubs and venues organizing regular games
- Tertiary: Amateur tournament organizers

### 2.3 Key Value Propositions

- Simple end-of-session data entry that doesn't interfere with gameplay
- Long-term statistics tracking across multiple sessions
- Social features that enhance the competitive nature of friendly poker leagues
- Insights that help players improve their game

## 3. Feature Requirements

### 3.1 User Management

- User registration and authentication
  - Email/password registration
  - Google Sign-In integration
  - Apple Sign-In for iOS users
  - Password recovery
- User profiles
  - Profile picture
  - Nickname/alias
  - Basic stats summary
  - Biographical information
- Deep link sharing
  - Ability to share league invites via deep links
  - QR code generation for easy league joining
  - Configurable league join permissions

### 3.2 League Management

- Create multiple leagues with customizable settings
  - League name and description
  - Private/public visibility
  - Member invite system
  - League avatar/image
- League roles and permissions
  - League Admin (can manage league settings, members, and edit historical stats if corrections are needed)
  - Member (can view stats and participate in games)
  - Viewer (can only view stats, cannot participate)
- Game administration
  - Any league member can start a game and become Game Admin
  - Only one Game Admin per active game
  - Game Admin can transfer admin rights to another player if they leave mid-game
  - Game Admin is responsible for recording buy-ins and cash-outs
- League settings
  - Default buy-in amounts
  - Currency settings
  - Game type preferences
  - Stat correction permissions (who can approve corrections)

### 3.3 Session Tracking

- Session creation and management
  - Date and time tracking
  - Location tagging
  - Host attribution
  - Session notes
  - Game Admin assignment and transfer capabilities
- Player buy-in tracking
  - Multiple buy-in support
  - Time-stamping of buy-ins (optional)
  - Game Admin approval for buy-ins
- Player cash-out recording
  - End-of-session balance entry
  - Calculating net profit/loss automatically
  - Game Admin verification of cash-outs
- Session correction mechanisms
  - Post-game correction requests
  - League Admin approval for corrections
  - Audit log of all corrections
- Session summary
  - Total pot size
  - Biggest winner/loser
  - Session duration
  - Game Admin history

### 3.4 Statistics Tracking

- Individual player statistics
  - Net profit/loss over time
  - Win/loss streak tracking
  - ROI percentages
  - Buy-in frequency
  - Average session profit
  - Consistency metrics
- League-wide statistics
  - Leaderboards
  - Biggest pots
  - Most frequent players
  - Historical trends
- Visual analytics
  - Profit/loss graphs over time
  - Performance comparisons between players
  - Heat maps for win/loss patterns

### 3.5 Social Features

- In-app messaging
  - League chat channels
  - Direct messaging between players
- Event planning
  - Session scheduling
  - RSVP functionality
  - Automated reminders
- Achievement system
  - Milestones for wins, participation, etc.
  - Custom badges for league achievements

### 3.6 Data Export and Sharing

- Export statistics to CSV/Excel
- Shareable reports and graphics for social media
- API for integration with other services (future enhancement)

## 4. Technical Requirements

### 4.1 Platform Support

- iOS (iPhone and iPad)
- Android (phones and tablets)
- Potential progressive web app (Phase 2)

### 4.2 Backend Infrastructure

- Database architecture
  - PostgreSQL via Supabase for all data storage
  - Materialized views for pre-calculated statistics
  - Database functions for complex statistical calculations
  - JSON/JSONB columns for flexible schema requirements
- Authentication and security
  - Clerk for authentication services
  - Google Sign-In integration via Clerk
  - Apple Sign-In integration via Clerk
  - Supabase Row-Level Security (RLS) for data protection
  - Integration between Clerk user IDs and Supabase policies
  - Data encryption for sensitive information
  - Regular security audits
- Cloud hosting
  - Supabase for database and storage
  - Clerk for authentication services
  - Scalable architecture for user growth

### 4.3 Frontend Development

- React Native with TypeScript
- Expo with Expo Router for file-based routing and navigation
- UI/UX considerations
  - Dark mode support
  - Accessibility compliance
  - Responsive design for various screen sizes

### 4.4 Data Synchronization

- Offline capability with sync when connection is available
- Conflict resolution for simultaneous edits
- Real-time updates for active sessions

### 4.5 Performance and Testing Requirements

- Performance metrics
  - App load time under 3 seconds
  - Data sync operations under 5 seconds
  - Statistics calculations optimized for minimal battery usage
- Testing framework
  - Jest for unit and integration testing
  - Component testing for React Native components
  - E2E testing with Detox
  - Test coverage requirements (minimum 75%)
- Analytics implementation
  - Umami analytics integration for privacy-focused usage tracking
  - Custom event tracking for key user actions
  - Performance monitoring
  - Conversion funnel analysis
- Error monitoring
  - Crash reporting
  - Error logging and alerting system

## 5. Monetization Strategy

### 5.1 Freemium Model

- **Free Tier**
  - One league with up to 8 players
  - Basic statistics tracking
  - Limited historical data (last 10 sessions)
- **Premium Tier** ($4.99/month or $39.99/year)
  - Unlimited leagues
  - Unlimited players per league
  - Comprehensive statistics
  - Unlimited historical data

### 5.2 In-App Purchases

- Advanced statistics packages ($2.99)
- Custom themes and visual customization ($1.99)
- Advertisement removal ($2.99)
- Export functionality ($1.99)

### 5.3 League Premium Pass

- One-time purchase per league ($9.99)
- Split cost among league members
- Unlocks premium features for specific league only

## 6. Development Roadmap

### 6.1 Phase 1: Foundation (Weeks 1-4)

#### Week 1: Project Setup & Authentication

- Initialize React Native project with Expo and TypeScript
- Set up NestJS backend project structure
- Configure Supabase project and initial database schema
- Set up Clerk authentication service
- Implement Google and Apple Sign-In with Clerk
- Configure deep linking for authentication flows
- Create basic navigation structure for the app
- Set up CI/CD pipelines with GitHub Actions

#### Week 2: Core Database & API Development

- Design and implement complete database schema in Supabase
- Create integration between Clerk user IDs and Supabase
- Implement league creation and management API
- Add league membership and roles functionality
- Set up Row Level Security in Supabase using Clerk user IDs
- Configure Supabase Policies for secure data access
- Create API documentation with Swagger/OpenAPI

#### Week 3: Session Management Backend

- Implement session creation and management API
- Build transaction recording system (buy-ins/cash-outs)
- Create game admin functionality and transfers
- Set up real-time data synchronization
- Add session summary calculations
- Implement data validation and error handling

#### Week 4: Basic Frontend Implementation

- Design and implement login/registration screens
- Create user profile management views
- Build league creation and management screens
- Implement league joining functionality
- Add deep linking for league invitations
- Set up basic navigation and auth state management

### 6.2 Phase 2: Core Functionality (Weeks 5-8)

#### Week 5: Session Interface Development

- Design and implement session creation flow
- Build buy-in recording interface
- Create cash-out recording interface
- Implement game admin controls and transfers
- Add session summary view
- Set up offline capability for session data

#### Week 6: Statistics Engine

- Create materialized views for common statistics
- Implement player performance metrics
- Build league-wide statistics calculations
- Add streak and trend calculations
- Create statistics API endpoints
- Implement database functions for complex calculations

#### Week 7: Statistics Visualization

- Design and implement player statistics dashboard
- Build profit/loss charts and visualizations
- Create leaderboard displays
- Add historical trend visualizations
- Implement comparative player statistics
- Set up data export functionality

#### Week 8: Corrections & Admin Features

- Implement post-session correction requests
- Build correction approval workflow
- Create audit logs for all changes
- Add league admin controls
- Implement notification system for admin actions
- Create user management interface for league admins

### 6.3 Phase 3: Polish & Additional Features (Weeks 9-12)

#### Week 9: Testing & Quality Assurance

- Set up Jest testing framework
- Write unit tests for critical components
- Create integration tests for key workflows
- Implement E2E testing with Detox
- Set up error monitoring and reporting
- Fix identified bugs and edge cases

#### Week 10: Monetization Implementation

- Design and implement subscription management
- Create in-app purchase functionality
- Implement free vs premium feature gates
- Add League Premium Pass purchase flow
- Set up analytics tracking for conversions
- Implement receipt validation and subscription management

#### Week 11: Social & Planning Features

- Build in-app messaging system
- Create session scheduling functionality
- Implement RSVP system
- Add achievement system and badges
- Create social sharing capabilities
- Implement player invitation system

#### Week 12: Final Polish & Launch Preparation

- Add dark mode and theme support
- Implement accessibility improvements
- Create app store assets and descriptions
- Write privacy policy and terms of service
- Conduct final performance optimizations
- Prepare for app store submission

### 6.4 Phase 4: Post-Launch & Future Development (Weeks 13+)

#### Week 13: Launch & Monitoring

- Submit to iOS App Store and Google Play Store
- Set up Umami analytics dashboard
- Configure crash reporting monitoring
- Implement feedback collection system
- Create support documentation
- Monitor initial user feedback and issues

#### Week 14+: Iterative Improvement

- Analyze user engagement data
- Prioritize feature enhancements based on feedback
- Implement A/B testing for key conversion points
- Begin work on Phase 2 features (tournament support)
- Explore web interface development
- Research AI-powered insights capabilities

## 7. Success Metrics

### 7.1 Key Performance Indicators

- User acquisition and retention rates
- Session frequency per user/league
- Conversion rate to premium subscriptions
- Average revenue per user (ARPU)
- User satisfaction rating

### 7.2 Analytics Implementation

- Umami for privacy-focused analytics
- Crash reporting and error monitoring
- A/B testing framework for feature optimization
- User feedback collection system

## 8. Compliance and Legal Considerations

### 8.1 Data Privacy

- GDPR compliance for European users
- CCPA compliance for California users
- Clear privacy policy and terms of service
- Data deletion capabilities

### 8.2 Gambling Regulations

- Clear disclaimers that the app is for tracking only
- No integration with real money transactions
- Age verification mechanisms
- Compliance with regional gambling laws

## 9. Security Considerations

### 9.1 Data Protection

- Encryption of sensitive user data
- Secure authentication practices
- Regular security audits
- Data backup and recovery procedures

### 9.2 Access Controls

- Role-based access within leagues
- Two-factor authentication for sensitive operations
- Session timeout and automatic logout features

## 10. User Interface Requirements

### 10.1 Screen Inventory

#### Authentication Screens

1. **Welcome Screen**

   - App logo/branding
   - Sign in with Google button
   - Sign in with Apple button
   - Email/password option
   - Brief value proposition

2. **Email Sign-Up Screen** (if needed)

   - Email input
   - Password creation
   - Terms & Privacy policy acknowledgment
   - Submit button

3. **Profile Setup**
   - Username/display name input
   - Optional profile picture upload
   - Brief bio/poker experience
   - Preferred currency selection

#### Main Navigation

4. **Home Dashboard**
   - Active leagues overview
   - Recent sessions summary
   - Quick stats (total profit/loss)
   - Upcoming scheduled games

#### League Management

5. **Leagues List**

   - List of all leagues user belongs to
   - League creation button
   - Search/filter functionality
   - League join option (via code/link)

6. **League Creation**

   - League name input
   - Description
   - Default buy-in amount
   - Currency selection
   - Privacy settings (public/private)

7. **League Dashboard**

   - League stats overview
   - Member leaderboard
   - Recent sessions
   - League settings access
   - Start new game button

8. **League Settings**

   - Edit league details
   - Manage members
   - Adjust permissions
   - League sharing options
   - Delete/leave league

9. **League Members**

   - List of all members with stats
   - Role indicators (League Admin, Member, Viewer)
   - Add member option
   - Role management (for League Admin)

10. **Join League**
    - QR code scanner
    - Join code input
    - Preview of league being joined
    - Confirmation step

#### Game Session Screens

11. **Session Creation**

    - Date/time picker
    - Location input or selection
    - Game type selection
    - Initial players selection
    - Buy-in amount setting

12. **Active Session**

    - List of current players
    - Buy-in tracking interface
    - Cash-out recording interface
    - Game admin controls
    - Session timer/duration

13. **Buy-In Recording**

    - Player selection
    - Amount input
    - Timestamp
    - Notes field
    - Confirmation dialog

14. **Cash-Out Recording**

    - Player selection
    - Final amount input
    - Profit/loss calculation display
    - Confirmation dialog

15. **Session Summary**

    - Total pot size
    - Duration
    - Winners/losers list
    - Individual performance metrics
    - Share results option

16. **Game Admin Transfer**
    - Current players list
    - Selection of new admin
    - Confirmation dialog
    - Reason for transfer (optional)

#### Statistics & Analytics

17. **Player Stats Dashboard**

    - Profit/loss over time chart
    - Win/loss streak display
    - ROI percentage
    - League comparison
    - Best/worst performance metrics

18. **League Statistics**

    - Comprehensive leaderboard
    - Trend analysis charts
    - Most profitable sessions
    - Player comparison tools
    - Historical data filters

19. **Session History**

    - List of all past sessions
    - Search/filter functionality
    - Date range selection
    - Detailed session view access

20. **Session Details**
    - Complete session information
    - Player performances
    - Buy-in/cash-out history
    - Game admin history
    - Correction request option

#### Social & Planning

21. **League Chat**

    - Message thread
    - Member presence indicators
    - Media sharing
    - Important announcements highlighting

22. **Game Scheduling**

    - Date/time selection
    - Location input
    - Invited players list
    - Recurring option
    - Notification settings

23. **RSVP Management**
    - Upcoming games list
    - Attendance response options
    - Attendee list view
    - Reminder settings

#### Settings & Profile

24. **User Profile**

    - Profile information display
    - Edit capabilities
    - Overall stats summary
    - Achievement badges
    - Connected accounts

25. **App Settings**

    - Notification preferences
    - Theme selection (dark/light)
    - Currency display options
    - Privacy controls
    - Session history export

26. **Subscription Management**

    - Current plan display
    - Upgrade options
    - Payment method management
    - Subscription benefits comparison

27. **Help & Support**
    - FAQ section
    - Contact support form
    - Tutorial/walkthrough access
    - Bug reporting tool

#### Monetization Screens

28. **Premium Features**

    - Feature comparison chart
    - Pricing options
    - Subscription benefits
    - Free trial information

29. **League Premium Upgrade**
    - Split payment explanation
    - Member contribution tracking
    - Payment processing
    - Confirmation screen

### 10.2 Navigation Structure

- File-based routing with Expo Router
  - Organized as app/(auth), app/(tabs), and app/modals
  - Nested routes for feature-specific screens
  - Modal presentations for quick actions
  - URL-based navigation supporting deep links by default
- Tab-based main navigation
  - Home/Dashboard
  - Leagues
  - Sessions
  - Stats
  - Profile/Settings

### 10.3 Design System

- Typography
  - Primary font: System default (San Francisco/Roboto)
  - Secondary font: Optional custom font for branding
  - Heading sizes: H1 (24pt), H2 (20pt), H3 (18pt), H4 (16pt)
  - Body text: 14pt
  - Caption text: 12pt
- Color scheme
  - Primary: #336699 (Blue)
  - Secondary: #66AACC (Light Blue)
  - Accent: #FFCC33 (Gold/Yellow)
  - Success: #33CC66 (Green)
  - Warning: #FFAA33 (Orange)
  - Error: #FF6666 (Red)
  - Neutrals: #F8F9FA, #E9ECEF, #DEE2E6, #CED4DA, #ADB5BD, #6C757D, #495057, #343A40, #212529
- Components
  - Buttons (Primary, Secondary, Tertiary, Danger)
  - Input fields (Text, Number, Date/Time, Selection)
  - Cards
  - Lists
  - Modals
  - Alerts and notifications
  - Charts and graphs
  - Loaders and spinners
- Dark mode adaptation
  - Background: #121212
  - Surface: #1E1E1E
  - Primary: #4D7CBD
  - Text on dark: #E1E1E1

## 11. Appendix

### 11.1 User Flows

- New user registration and onboarding
- League creation and member invitation
- Session recording process
- Statistics viewing and analysis

### 11.2 Technical Stack Details

- Frontend: React Native, Expo with Expo Router, TypeScript
- Backend: NestJS with TypeScript
- Database: PostgreSQL via Supabase
- Authentication: Clerk (Google Sign-In, Apple Sign-In)
- Storage: Supabase Storage
- Real-time: Supabase Realtime
- CI/CD: GitHub Actions
- Testing: Jest, React Testing Library, Detox
- Analytics: Umami (privacy-focused analytics)
- State Management: Redux Toolkit or Zustand
- Form Handling: React Hook Form with Zod validation

### 11.3 API Documentation

- Authentication endpoints
- User management endpoints
- League and session endpoints
- Statistics and reporting endpoints

### 11.4 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leagues table
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  default_buy_in DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- League Members join table with roles
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('league_admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  current_admin_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin transfers history
CREATE TABLE admin_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  previous_admin_id UUID NOT NULL REFERENCES users(id),
  new_admin_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table for buy-ins and cash-outs
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('buy_in', 'cash_out')),
  amount DECIMAL(10,2) NOT NULL,
  approved_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Corrections table for post-game adjustments
CREATE TABLE corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  original_data JSONB NOT NULL,
  corrected_data JSONB NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 11.5 Implementation Notes

#### Development Environment Setup

- Node.js v18+ for backend development
- Expo SDK 50+ for React Native
- Supabase CLI for local development
- Git for version control
- VS Code with ESLint and Prettier

#### Key Technologies Per Component

#### Frontend

- React Native / Expo
- Expo Router for file-based navigation
- TypeScript
- Zustand for state management
- React Hook Form with Zod for form validation
- Recharts for data visualization
- React Native Reanimated for animations
- Clerk for authentication
- Expo WebBrowser for auth flows

##### Backend

- NestJS with TypeScript
- Supabase for database and storage
- Clerk for user management and authentication
- PostgreSQL for data storage
- Jest for testing
- Swagger for API documentation

#### Database Migration Strategy

- Initial schema creation with Supabase migrations
- Schema changes deployed with migration scripts
- Test migrations in staging environment before production
- Data backups before each migration

#### Testing Strategy

- Unit tests for all utility functions and services
- Component tests for UI elements
- Integration tests for critical workflows
- E2E tests for key user journeys
- Coverage targets:
  - Core business logic: 85%+
  - UI components: 75%+
  - Overall: 80%+

### 11.6 App Store Descriptions

#### Short Description (30 words)

Track your poker home game stats with PokerLeaguePro. Record buy-ins, cash-outs, and view detailed performance metrics for your poker league. Perfect for weekly cash games with friends.

#### Long Description (4000 characters max)

PokerLeaguePro: The Ultimate Poker Statistics Tracker for Cash Games

Are you tired of trying to remember who's up or down in your weekly poker games? Do you want to know who's truly the best player in your group over time? PokerLeaguePro is the definitive solution for tracking and analyzing your home poker games.

SIMPLE GAME TRACKING
• Record buy-ins and cash-outs without disrupting gameplay
• Track multiple buy-ins per player
• End-of-session balance entry
• No need to log every hand or play

COMPREHENSIVE STATISTICS
• See who's winning (or losing) over time
• Track profit/loss trends with beautiful visualizations
• Identify your longest winning and losing streaks
• Calculate ROI percentages and other performance metrics
• Compare player performance across different leagues

LEAGUE MANAGEMENT
• Create and join multiple poker leagues
• Invite friends via deep links or QR codes
• Assign league admins for management control
• Set custom settings for each league

GAME ADMINISTRATION
• Any league member can start a game and become Game Admin
• Transfer admin rights if you need to leave mid-game
• Game Admin handles recording all buy-ins and cash-outs
• League Admin can make corrections if needed

SOCIAL FEATURES
• In-app chat for each league
• Schedule upcoming games
• RSVP system for game planning
• Share results on social media

SUBSCRIPTION OPTIONS
• Free tier: Track one league with up to 8 players
• Premium: Unlimited leagues and players, advanced statistics
• League Premium Pass: Split the cost among league members

Whether you're running a casual weekly game or a serious home cash league, PokerLeaguePro provides the tools you need to track performance, settle disputes, and add a new competitive dimension to your poker nights.

Download now and discover who really is the shark at your poker table!

Note: PokerLeaguePro is designed for statistical tracking only and does not facilitate gambling or monetary transactions. All games and transactions should be conducted in accordance with local laws.

## 12. Localization Requirements

### 12.1 Supported Languages

- English (default)
- Hebrew

### 12.2 Localization Implementation

- All UI text elements must support translation
- RTL (Right-to-Left) layout support for Hebrew
- Date formatting according to locale standards
- Number and currency formatting according to locale
- User preference persistence for selected language
- Dynamic language switching without app restart

### 12.3 Translation Management

- JSON-based translation files
- String extraction and management workflow
- Translation review process
- Support for pluralization rules
- Handling of untranslated strings

### 12.4 UI Considerations for Localization

- Flexible layouts to accommodate text expansion/contraction
- RTL layout mirroring for Hebrew
- Icon and image mirroring where culturally appropriate
- Font support for Hebrew characters
- Preservation of numerals in statistical displays# PokerLeaguePro - Product Requirements Document

## 1. Executive Summary

PokerLeaguePro is a mobile application designed to track statistics for live cash poker games played among friends. The app enables users to create leagues, record session results, and view comprehensive statistics about players' performance over time. The primary goal is to create a simple yet powerful tool for poker enthusiasts to enhance their home game experience without the complexity of tracking every hand or play.

## 2. Product Overview

### 2.1 Problem Statement

Poker players who organize regular cash games with friends lack an easy way to track long-term performance metrics and league statistics. Current solutions are either too complex (requiring hand-by-hand tracking) or too simple (basic spreadsheets).

### 2.2 Target Audience

- Primary: Recreational poker players who host or participate in regular home cash games
- Secondary: Small poker clubs and venues organizing regular games
- Tertiary: Amateur tournament organizers

### 2.3 Key Value Propositions

- Simple end-of-session data entry that doesn't interfere with gameplay
- Long-term statistics tracking across multiple sessions
- Social features that enhance the competitive nature of friendly poker leagues
- Insights that help players improve their game

## 3. Feature Requirements

### 3.1 User Management

- User registration and authentication
  - Email/password registration
  - Google Sign-In integration
  - Apple Sign-In for iOS users
  - Password recovery
- User profiles
  - Profile picture
  - Nickname/alias
  - Basic stats summary
  - Biographical information
- Deep link sharing
  - Ability to share league invites via deep links
  - QR code generation for easy league joining
  - Configurable league join permissions
- Language preferences
  - Default language selection (English)
  - Hebrew language support
  - Ability to switch languages from profile settings

### 3.2 League Management

- Create multiple leagues with customizable settings
  - League name and description
  - Private/public visibility
  - Member invite system
  - League avatar/image
- League roles and permissions
  - League Admin (can manage league settings, members, and edit historical stats if corrections are needed)
  - Member (can view stats and participate in games)
  - Viewer (can only view stats, cannot participate)
- Game administration
  - Any league member can start a game and become Game Admin
  - Only one Game Admin per active game
  - Game Admin can transfer admin rights to another player if they leave mid-game
  - Game Admin is responsible for recording buy-ins and cash-outs
- League settings
  - Default buy-in amounts
  - Currency settings
  - Game type preferences
  - Stat correction permissions (who can approve corrections)

### 3.3 Session Tracking

- Session creation and management
  - Date and time tracking
  - Location tagging
  - Host attribution
  - Session notes
  - Game Admin assignment and transfer capabilities
- Player buy-in tracking
  - Multiple buy-in support
  - Time-stamping of buy-ins (optional)
  - Game Admin approval for buy-ins
- Player cash-out recording
  - End-of-session balance entry
  - Calculating net profit/loss automatically
  - Game Admin verification of cash-outs
- Session correction mechanisms
  - Post-game correction requests
  - League Admin approval for corrections
  - Audit log of all corrections
- Session summary
  - Total pot size
  - Biggest winner/loser
  - Session duration
  - Game Admin history

### 3.4 Statistics Tracking

- Individual player statistics
  - Net profit/loss over time
  - Win/loss streak tracking
  - ROI percentages
  - Buy-in frequency
  - Average session profit
  - Consistency metrics
- League-wide statistics
  - Leaderboards
  - Biggest pots
  - Most frequent players
  - Historical trends
- Visual analytics
  - Profit/loss graphs over time
  - Performance comparisons between players
  - Heat maps for win/loss patterns

### 3.5 Social Features

- In-app messaging
  - League chat channels
  - Direct messaging between players
- Event planning
  - Session scheduling
  - RSVP functionality
  - Automated reminders
- Achievement system
  - Milestones for wins, participation, etc.
  - Custom badges for league achievements

### 3.6 Data Export and Sharing

- Export statistics to CSV/Excel
- Shareable reports and graphics for social media
- API for integration with other services (future enhancement)

## 4. Technical Requirements

### 4.1 Platform Support

- iOS (iPhone and iPad)
- Android (phones and tablets)
- Potential progressive web app (Phase 2)

### 4.2 Backend Infrastructure

- NestJS framework with TypeScript
- Database architecture
  - PostgreSQL via Supabase for all data storage
  - Materialized views for pre-calculated statistics
  - Database functions for complex statistical calculations
  - JSON/JSONB columns for flexible schema requirements
- Authentication and security
  - Clerk for authentication services
  - Google Sign-In integration via Clerk
  - Apple Sign-In integration via Clerk
  - Supabase Row-Level Security (RLS) for data protection
  - Integration between Clerk user IDs and Supabase policies
  - Data encryption for sensitive information
  - Regular security audits
- Cloud hosting
  - Supabase for database and storage
  - Clerk for authentication services
  - AWS/Vercel/Heroku for NestJS API deployment
  - Scalable architecture for user growth

### 4.3 Frontend Development

- React Native with TypeScript
- Expo with Expo Router for file-based routing and navigation
- UI/UX considerations
  - Dark mode support
  - Accessibility compliance
  - Responsive design for various screen sizes
  - Localization support (English and Hebrew)
  - RTL layout support for Hebrew language

### 4.4 Data Synchronization

- Offline capability with sync when connection is available
- Conflict resolution for simultaneous edits
- Real-time updates for active sessions

### 4.5 Performance and Testing Requirements

- Performance metrics
  - App load time under 3 seconds
  - Data sync operations under 5 seconds
  - Statistics calculations optimized for minimal battery usage
- Testing framework
  - Jest for unit and integration testing
  - Component testing for React Native components
  - E2E testing with Detox
  - Test coverage requirements (minimum 75%)
- Analytics implementation
  - Umami analytics integration for privacy-focused usage tracking
  - Custom event tracking for key user actions
  - Performance monitoring
  - Conversion funnel analysis
- Error monitoring
  - Crash reporting
  - Error logging and alerting system

## 5. Monetization Strategy

### 5.1 Freemium Model

- **Free Tier**
  - One league with up to 8 players
  - Basic statistics tracking
  - Limited historical data (last 10 sessions)
- **Premium Tier** ($4.99/month or $39.99/year)
  - Unlimited leagues
  - Unlimited players per league
  - Comprehensive statistics
  - Unlimited historical data

### 5.2 In-App Purchases

- Advanced statistics packages ($2.99)
- Custom themes and visual customization ($1.99)
- Advertisement removal ($2.99)
- Export functionality ($1.99)

### 5.3 League Premium Pass

- One-time purchase per league ($9.99)
- Split cost among league members
- Unlocks premium features for specific league only

## 6. Development Roadmap

### 6.1 Phase 1: Foundation (Weeks 1-4)

#### Week 1: Project Setup & Authentication

- Initialize React Native project with Expo and TypeScript
- Set up NestJS backend project structure
- Configure Supabase project and initial database schema
- Set up Clerk authentication service
- Implement Google and Apple Sign-In with Clerk
- Configure deep linking for authentication flows
- Create basic navigation structure for the app
- Set up CI/CD pipelines with GitHub Actions

#### Week 2: Core Database & API Development

- Design and implement complete database schema in Supabase
- Create integration between Clerk user IDs and Supabase
- Implement league creation and management API
- Add league membership and roles functionality
- Set up Row Level Security in Supabase using Clerk user IDs
- Configure Supabase Policies for secure data access
- Create API documentation with Swagger/OpenAPI

#### Week 3: Session Management Backend

- Implement session creation and management API
- Build transaction recording system (buy-ins/cash-outs)
- Create game admin functionality and transfers
- Set up real-time data synchronization
- Add session summary calculations
- Implement data validation and error handling

#### Week 4: Basic Frontend Implementation

- Design and implement login/registration screens
- Create user profile management views
- Build league creation and management screens
- Implement league joining functionality
- Add deep linking for league invitations
- Set up basic navigation and auth state management

### 6.2 Phase 2: Core Functionality (Weeks 5-8)

#### Week 5: Session Interface Development

- Design and implement session creation flow
- Build buy-in recording interface
- Create cash-out recording interface
- Implement game admin controls and transfers
- Add session summary view
- Set up offline capability for session data

#### Week 6: Statistics Engine

- Create materialized views for common statistics
- Implement player performance metrics
- Build league-wide statistics calculations
- Add streak and trend calculations
- Create statistics API endpoints
- Implement database functions for complex calculations

#### Week 7: Statistics Visualization

- Design and implement player statistics dashboard
- Build profit/loss charts and visualizations
- Create leaderboard displays
- Add historical trend visualizations
- Implement comparative player statistics
- Set up data export functionality

#### Week 8: Corrections & Admin Features

- Implement post-session correction requests
- Build correction approval workflow
- Create audit logs for all changes
- Add league admin controls
- Implement notification system for admin actions
- Create user management interface for league admins

### 6.3 Phase 3: Polish & Additional Features (Weeks 9-12)

#### Week 9: Testing & Quality Assurance

- Set up Jest testing framework
- Write unit tests for critical components
- Create integration tests for key workflows
- Implement E2E testing with Detox
- Set up error monitoring and reporting
- Fix identified bugs and edge cases

#### Week 10: Monetization Implementation

- Design and implement subscription management
- Create in-app purchase functionality
- Implement free vs premium feature gates
- Add League Premium Pass purchase flow
- Set up analytics tracking for conversions
- Implement receipt validation and subscription management

#### Week 11: Social & Planning Features

- Build in-app messaging system
- Create session scheduling functionality
- Implement RSVP system
- Add achievement system and badges
- Create social sharing capabilities
- Implement player invitation system

#### Week 12: Final Polish & Launch Preparation

- Add dark mode and theme support
- Implement accessibility improvements
- Create app store assets and descriptions
- Write privacy policy and terms of service
- Conduct final performance optimizations
- Prepare for app store submission

### 6.4 Phase 4: Post-Launch & Future Development (Weeks 13+)

#### Week 13: Launch & Monitoring

- Submit to iOS App Store and Google Play Store
- Set up Umami analytics dashboard
- Configure crash reporting monitoring
- Implement feedback collection system
- Create support documentation
- Monitor initial user feedback and issues

#### Week 14+: Iterative Improvement

- Analyze user engagement data
- Prioritize feature enhancements based on feedback
- Implement A/B testing for key conversion points
- Begin work on Phase 2 features (tournament support)
- Explore web interface development
- Research AI-powered insights capabilities

## 7. Success Metrics

### 7.1 Key Performance Indicators

- User acquisition and retention rates
- Session frequency per user/league
- Conversion rate to premium subscriptions
- Average revenue per user (ARPU)
- User satisfaction rating

### 7.2 Analytics Implementation

- Umami for privacy-focused analytics
- Crash reporting and error monitoring
- A/B testing framework for feature optimization
- User feedback collection system

## 8. Compliance and Legal Considerations

### 8.1 Data Privacy

- GDPR compliance for European users
- CCPA compliance for California users
- Clear privacy policy and terms of service
- Data deletion capabilities

### 8.2 Gambling Regulations

- Clear disclaimers that the app is for tracking only
- No integration with real money transactions
- Age verification mechanisms
- Compliance with regional gambling laws

## 9. Security Considerations

### 9.1 Data Protection

- Encryption of sensitive user data
- Secure authentication practices
- Regular security audits
- Data backup and recovery procedures

### 9.2 Access Controls

- Role-based access within leagues
- Two-factor authentication for sensitive operations
- Session timeout and automatic logout features

## 10. User Interface Requirements

### 10.1 Screen Inventory

#### Authentication Screens

1. **Welcome Screen**

   - App logo/branding
   - Sign in with Google button
   - Sign in with Apple button
   - Email/password option
   - Brief value proposition

2. **Email Sign-Up Screen** (if needed)

   - Email input
   - Password creation
   - Terms & Privacy policy acknowledgment
   - Submit button

3. **Profile Setup**
   - Username/display name input
   - Optional profile picture upload
   - Brief bio/poker experience
   - Preferred currency selection

#### Main Navigation

4. **Home Dashboard**
   - Active leagues overview
   - Recent sessions summary
   - Quick stats (total profit/loss)
   - Upcoming scheduled games

#### League Management

5. **Leagues List**

   - List of all leagues user belongs to
   - League creation button
   - Search/filter functionality
   - League join option (via code/link)

6. **League Creation**

   - League name input
   - Description
   - Default buy-in amount
   - Currency selection
   - Privacy settings (public/private)

7. **League Dashboard**

   - League stats overview
   - Member leaderboard
   - Recent sessions
   - League settings access
   - Start new game button

8. **League Settings**

   - Edit league details
   - Manage members
   - Adjust permissions
   - League sharing options
   - Delete/leave league

9. **League Members**

   - List of all members with stats
   - Role indicators (League Admin, Member, Viewer)
   - Add member option
   - Role management (for League Admin)

10. **Join League**
    - QR code scanner
    - Join code input
    - Preview of league being joined
    - Confirmation step

#### Game Session Screens

11. **Session Creation**

    - Date/time picker
    - Location input or selection
    - Game type selection
    - Initial players selection
    - Buy-in amount setting

12. **Active Session**

    - List of current players
    - Buy-in tracking interface
    - Cash-out recording interface
    - Game admin controls
    - Session timer/duration

13. **Buy-In Recording**

    - Player selection
    - Amount input
    - Timestamp
    - Notes field
    - Confirmation dialog

14. **Cash-Out Recording**

    - Player selection
    - Final amount input
    - Profit/loss calculation display
    - Confirmation dialog

15. **Session Summary**

    - Total pot size
    - Duration
    - Winners/losers list
    - Individual performance metrics
    - Share results option

16. **Game Admin Transfer**
    - Current players list
    - Selection of new admin
    - Confirmation dialog
    - Reason for transfer (optional)

#### Statistics & Analytics

17. **Player Stats Dashboard**

    - Profit/loss over time chart
    - Win/loss streak display
    - ROI percentage
    - League comparison
    - Best/worst performance metrics

18. **League Statistics**

    - Comprehensive leaderboard
    - Trend analysis charts
    - Most profitable sessions
    - Player comparison tools
    - Historical data filters

19. **Session History**

    - List of all past sessions
    - Search/filter functionality
    - Date range selection
    - Detailed session view access

20. **Session Details**
    - Complete session information
    - Player performances
    - Buy-in/cash-out history
    - Game admin history
    - Correction request option

#### Social & Planning

21. **League Chat**

    - Message thread
    - Member presence indicators
    - Media sharing
    - Important announcements highlighting

22. **Game Scheduling**

    - Date/time selection
    - Location input
    - Invited players list
    - Recurring option
    - Notification settings

23. **RSVP Management**
    - Upcoming games list
    - Attendance response options
    - Attendee list view
    - Reminder settings

#### Settings & Profile

24. **User Profile**

    - Profile information display
    - Edit capabilities
    - Overall stats summary
    - Achievement badges
    - Connected accounts

25. **App Settings**

    - Notification preferences
    - Theme selection (dark/light)
    - Currency display options
    - Privacy controls
    - Session history export

26. **Subscription Management**

    - Current plan display
    - Upgrade options
    - Payment method management
    - Subscription benefits comparison

27. **Help & Support**
    - FAQ section
    - Contact support form
    - Tutorial/walkthrough access
    - Bug reporting tool

#### Monetization Screens

28. **Premium Features**

    - Feature comparison chart
    - Pricing options
    - Subscription benefits
    - Free trial information

29. **League Premium Upgrade**
    - Split payment explanation
    - Member contribution tracking
    - Payment processing
    - Confirmation screen

### 10.2 Navigation Structure

- File-based routing with Expo Router
  - Organized as app/(auth), app/(tabs), and app/modals
  - Nested routes for feature-specific screens
  - Modal presentations for quick actions
  - URL-based navigation supporting deep links by default
- Tab-based main navigation
  - Home/Dashboard
  - Leagues
  - Sessions
  - Stats
  - Profile/Settings

### 10.3 Design System

- Typography
  - Primary font: System default (San Francisco/Roboto)
  - Secondary font: Optional custom font for branding
  - Heading sizes: H1 (24pt), H2 (20pt), H3 (18pt), H4 (16pt)
  - Body text: 14pt
  - Caption text: 12pt
- Color scheme
  - Primary: #336699 (Blue)
  - Secondary: #66AACC (Light Blue)
  - Accent: #FFCC33 (Gold/Yellow)
  - Success: #33CC66 (Green)
  - Warning: #FFAA33 (Orange)
  - Error: #FF6666 (Red)
  - Neutrals: #F8F9FA, #E9ECEF, #DEE2E6, #CED4DA, #ADB5BD, #6C757D, #495057, #343A40, #212529
- Components
  - Buttons (Primary, Secondary, Tertiary, Danger)
  - Input fields (Text, Number, Date/Time, Selection)
  - Cards
  - Lists
  - Modals
  - Alerts and notifications
  - Charts and graphs
  - Loaders and spinners
- Dark mode adaptation
  - Background: #121212
  - Surface: #1E1E1E
  - Primary: #4D7CBD
  - Text on dark: #E1E1E1

## 11. Appendix

### 11.1 User Flows

- New user registration and onboarding
- League creation and member invitation
- Session recording process
- Statistics viewing and analysis

### 11.2 Technical Stack Details

- Frontend: React Native, Expo with Expo Router, TypeScript
- Backend: NestJS with TypeScript
- Database: PostgreSQL via Supabase
- Authentication: Clerk (Google Sign-In, Apple Sign-In)
- Storage: Supabase Storage
- Real-time: Supabase Realtime
- CI/CD: GitHub Actions
- Testing: Jest, React Testing Library, Detox
- Analytics: Umami (privacy-focused analytics)
- State Management: Redux Toolkit or Zustand
- Form Handling: React Hook Form with Zod validation

### 11.3 API Documentation

- Authentication endpoints
- User management endpoints
- League and session endpoints
- Statistics and reporting endpoints

### 11.4 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leagues table
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  default_buy_in DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- League Members join table with roles
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('league_admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  current_admin_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin transfers history
CREATE TABLE admin_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  previous_admin_id UUID NOT NULL REFERENCES users(id),
  new_admin_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table for buy-ins and cash-outs
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('buy_in', 'cash_out')),
  amount DECIMAL(10,2) NOT NULL,
  approved_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Corrections table for post-game adjustments
CREATE TABLE corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  original_data JSONB NOT NULL,
  corrected_data JSONB NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 11.5 Implementation Notes

#### Development Environment Setup

- Node.js v18+ for backend development
- pnpm as the package manager (preferred over npm)
- Expo SDK 50+ for React Native
- Supabase CLI for local development
- Git for version control
- VS Code with ESLint and Prettier

#### Key Technologies Per Component

#### Frontend

- React Native / Expo
- Expo Router for file-based navigation
- TypeScript
- Zustand for state management
- React Hook Form with Zod for form validation
- Recharts for data visualization
- React Native Reanimated for animations
- Clerk for authentication
- Expo WebBrowser for auth flows
- i18next for internationalization (English/Hebrew)

##### Backend

- NestJS with TypeScript
- Supabase for database and storage
- Clerk for user management and authentication
- PostgreSQL for data storage
- Jest for testing
- Swagger for API documentation

#### Database Migration Strategy

- Initial schema creation with Supabase migrations
- Schema changes deployed with migration scripts
- Test migrations in staging environment before production
- Data backups before each migration

#### Testing Strategy

- Unit tests for all utility functions and services
- Component tests for UI elements
- Integration tests for critical workflows
- E2E tests for key user journeys
- Coverage targets:
  - Core business logic: 85%+
  - UI components: 75%+
  - Overall: 80%+

### 11.6 App Store Descriptions

#### Short Description (30 words)

Track your poker home game stats with PokerLeaguePro. Record buy-ins, cash-outs, and view detailed performance metrics for your poker league. Perfect for weekly cash games with friends.

#### Long Description (4000 characters max)

PokerLeaguePro: The Ultimate Poker Statistics Tracker for Cash Games

Are you tired of trying to remember who's up or down in your weekly poker games? Do you want to know who's truly the best player in your group over time? PokerLeaguePro is the definitive solution for tracking and analyzing your home poker games.

SIMPLE GAME TRACKING
• Record buy-ins and cash-outs without disrupting gameplay
• Track multiple buy-ins per player
• End-of-session balance entry
• No need to log every hand or play

COMPREHENSIVE STATISTICS
• See who's winning (or losing) over time
• Track profit/loss trends with beautiful visualizations
• Identify your longest winning and losing streaks
• Calculate ROI percentages and other performance metrics
• Compare player performance across different leagues

LEAGUE MANAGEMENT
• Create and join multiple poker leagues
• Invite friends via deep links or QR codes
• Assign league admins for management control
• Set custom settings for each league

GAME ADMINISTRATION
• Any league member can start a game and become Game Admin
• Transfer admin rights if you need to leave mid-game
• Game Admin handles recording all buy-ins and cash-outs
• League Admin can make corrections if needed

SOCIAL FEATURES
• In-app chat for each league
• Schedule upcoming games
• RSVP system for game planning
• Share results on social media

SUBSCRIPTION OPTIONS
• Free tier: Track one league with up to 8 players
• Premium: Unlimited leagues and players, advanced statistics
• League Premium Pass: Split the cost among league members

Whether you're running a casual weekly game or a serious home cash league, PokerLeaguePro provides the tools you need to track performance, settle disputes, and add a new competitive dimension to your poker nights.

Download now and discover who really is the shark at your poker table!

Note: PokerLeaguePro is designed for statistical tracking only and does not facilitate gambling or monetary transactions. All games and transactions should be conducted in accordance with local laws.

'## 12. User Onboarding'

### 12.1 Onboarding Flow Overview

The onboarding process is designed to get users quickly engaged with the core functionality while allowing them to defer non-essential setup steps. The flow prioritizes immediate value delivery over comprehensive profile completion.

### 12.2 Post-Authentication Onboarding Steps

#### Step 1: Nickname Setup Modal (Optional)

- **Trigger**: Immediately after successful authentication for new users
- **Content**:
  - Welcome message explaining the purpose of nicknames in poker leagues
  - Text input for nickname/display name
  - Character limit indicator (2-20 characters)
  - Real-time validation feedback
  - Two action buttons:
    - "Set Nickname" (primary action)
    - "I'll do this later" (secondary action)
- **Behavior**:
  - If nickname is set: Continue to Step 2
  - If "I'll do this later" is selected: Continue to Step 2 with default display name from auth provider
  - Modal can be dismissed by tapping outside (treated as "I'll do this later")
- **Persistence**: Users who skip this step will see a nickname reminder in their profile until they set one

#### Step 2: Welcome Tour (Progressive Disclosure)

- **Screen 1: Welcome & Value Proposition**
  - App logo and welcome message
  - Brief explanation of core value: "Track your poker games with friends"
  - Continue button
- **Screen 2: League Concept Introduction**
  - Visual representation of a league (group of friends)
  - Explanation: "Create or join leagues to track games with your poker groups"
  - Example: "Work poker night, weekend home games, etc."
  - Continue button
- **Screen 3: Session Tracking Overview**
  - Visual of buy-in/cash-out process
  - Explanation: "Record buy-ins and cash-outs at the end of each session"
  - Emphasis on simplicity: "No need to track every hand"
  - Continue button
- **Screen 4: Statistics Preview**
  - Sample charts and leaderboard
  - Explanation: "See who's really winning over time"
  - Get Started button

#### Step 3: First Action Choice

- **Purpose**: Get users immediately engaged with core functionality
- **Options Presented**:
  - **"Create My First League"** (Primary recommendation)
    - Emphasized as the best way to get started
    - Leads to simplified league creation flow
  - **"Join an Existing League"**
    - For users who were invited or have a league code
    - Leads to league joining flow
  - **"Explore the App First"**
    - For users who want to see the interface
    - Leads to main app with tutorial overlays available
- **Visual Design**: Card-based layout with clear call-to-action buttons

### 12.3 Simplified League Creation Flow (First-Time Users)

When users choose to create their first league, they enter a streamlined flow:

#### Screen 1: League Basics

- League name input (required)
- Brief description (optional, with helpful placeholder text)
- Default settings pre-filled (can be changed later)
- Continue button

#### Screen 2: Initial Settings

- Default buy-in amount
- Currency selection (auto-detected based on locale)
- Privacy setting: Private (recommended) or Public
- Continue button

#### Screen 3: Invite Friends (Optional)

- Explanation of how inviting works
- Options:
  - Generate invite link to share
  - Show QR code for in-person sharing
  - "I'll invite people later" option
- Skip/Continue options

#### Screen 4: Success & Next Steps

- Congratulations message
- League created successfully
- Quick tips for next steps:
  - How to start your first game
  - How to invite more members
  - Where to find league settings
- "Start First Game" or "Go to League Dashboard" buttons

### 12.4 League Joining Flow (Invited Users)

For users who choose to join an existing league:

#### Screen 1: Join Method Selection

- QR code scanner option
- Text input for league code/invite link
- Example of what codes look like
- Clear instructions

#### Screen 2: League Preview

- League name and description
- Current member count
- Admin information
- Privacy/public status
- Join/Cancel buttons

#### Screen 3: Join Confirmation

- Welcome to [League Name] message
- Brief overview of what they can do now
- "Go to League" button

### 12.5 Tutorial System

#### Progressive Disclosure Tutorials

- **Context-sensitive help**: Small tutorial overlays appear when users first access major features
- **Interactive tutorials**: Step-by-step guides for complex processes like starting a session
- **Help center integration**: Easily accessible from any screen

#### Key Tutorial Topics

1. **Starting Your First Game Session**

   - How to become Game Admin
   - Recording buy-ins and cash-outs
   - Ending a session

2. **Understanding Statistics**

   - Reading profit/loss charts
   - Interpreting leaderboards
   - Accessing detailed player stats

3. **League Management**
   - Inviting new members
   - Managing roles and permissions
   - League settings overview

### 12.6 Onboarding Completion Tracking

#### Progress Indicators

- Track completion of key onboarding milestones
- Show progress indicators where appropriate
- Celebrate completed steps

#### Key Milestones

1. ✓ Account created and authenticated
2. ✓ Nickname set (optional but tracked)
3. ✓ First league created or joined
4. ✓ First game session participated in
5. ✓ First statistics viewed

#### Re-engagement for Incomplete Onboarding

- Gentle reminders for users who haven't completed key steps
- Contextual prompts to continue onboarding when appropriate
- No aggressive re-engagement that disrupts user experience

### 12.7 Onboarding Analytics

#### Key Metrics to Track

- Onboarding funnel completion rates
- Drop-off points in the flow
- Time to complete each step
- Most common paths through onboarding
- Correlation between onboarding completion and long-term retention

#### A/B Testing Opportunities

- Different welcome tour content and length
- Variations in first action choice presentation
- Different levels of guidance vs. self-discovery

### 12.8 Technical Implementation

#### Onboarding State Management

- Track onboarding progress in local storage and user profile
- Sync onboarding state across devices
- Handle interrupted onboarding gracefully

#### Modal and Navigation Handling

- Proper modal stack management
- Deep link handling during onboarding
- Graceful handling of app backgrounding/foregrounding

#### Accessibility Considerations

- Screen reader support for all onboarding content
- Keyboard navigation support
- High contrast mode compatibility
- Respect for reduced motion preferences

### 12.9 Onboarding Content Localization

#### Multi-language Support

- All onboarding content available in English and Hebrew
- Culturally appropriate examples and terminology
- RTL layout support for Hebrew onboarding flow
- Region-specific default settings (currency, number formats)

#### Content Guidelines

- Keep text concise and action-oriented
- Use friendly, encouraging tone
- Avoid poker jargon for newcomers
- Include visual aids where helpful

## 13. Localization Requirements

### 13.1 Supported Languages

- English (default)
- Hebrew

### 13.2 Localization Implementation

- All UI text elements must support translation
- RTL (Right-to-Left) layout support for Hebrew
- Date formatting according to locale standards
- Number and currency formatting according to locale
- User preference persistence for selected language
- Dynamic language switching without app restart

### 13.3 Translation Management

- JSON-based translation files
- String extraction and management workflow
- Translation review process
- Support for pluralization rules
- Handling of untranslated strings

### 13.4 UI Considerations for Localization

- Flexible layouts to accommodate text expansion/contraction
- RTL layout mirroring for Hebrew
- Icon and image mirroring where culturally appropriate
- Font support for Hebrew characters
- Preservation of numerals in statistical displays
