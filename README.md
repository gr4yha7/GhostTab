<div align="center">

## GHOST TAB

**A Web2.5 Social Payments Platform for Peer-to-Peer Obligations**

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0-black.svg)](https://expo.dev/)
[![Movement](https://img.shields.io/badge/Movement-Testnet-green.svg)](https://movementlabs.xyz/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Core Services](#core-services)
- [Technical Architecture](#technical-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [License](#license)

---

## Overview

GhostTab is a mobile-first Web2.5 application that bridges social obligations with blockchain settlement guarantees. Built on Movement testnet, GhostTab enables users to create, track, and settle peer-to-peer tabs and group expenses while maintaining the familiar UX of traditional social apps.

The platform employs a hybrid architecture where social interactions and coordination happen offchain (Supabase, GetStream.io), while financial obligations and settlements are recorded onchain (Movement). All blockchain transactions are gas-sponsored by Shinami, delivering a completely gasless experience for end users.

### Key Highlights

- 📱 **Native Mobile App** - Built with React Native (Expo) and styled with NativeWind
- ⛽ **Zero Gas Fees** - All onchain transactions sponsored by Shinami
- 🔐 **Web2 Authentication** - Email/social login with OTP verification via Privy
- 🤝 **Social Graph-Based** - Friends-only tabs anchored in real relationships
- 📊 **Reputation System** - Transparent trust scores based on payment behavior
- 💬 **Built-in Messaging** - Group chat powered by GetStream.io
- ⚡ **Instant Settlement** - USDC settlements on Movement with dual-state recording
- 🎯 **Smart Notifications** - Context-aware reminders for tabs and payments

---

## Problem Statement

Traditional peer-to-peer payment apps face several limitations:

1. **Lack of Obligation Guarantees** - Payments rely on trust without enforcement mechanisms
2. **No Portable Reputation** - Payment history doesn't travel across platforms
3. **Centralized Control** - Single points of failure and data custody concerns
4. **High Settlement Costs** - Traditional payment rails charge 2-3% fees
5. **Poor Social Context** - Payments divorced from the social relationships they represent

Existing crypto solutions often suffer from:

- **Poor UX** - Gas fees, wallet management, and blockchain complexity
- **No Social Layer** - Pure financial primitives without relationship context
- **Aggressive Liquidation** - Forced settlements that damage relationships
- **Lack of Flexibility** - One-size-fits-all approaches to social obligations

---

## Solution

GhostTab combines the best of Web2 and Web3:

### Web2 Experience Layer
- Familiar email/social login (Privy)
- Mobile-first React Native interface
- Real-time messaging and notifications
- Offchain data for instant reads (Supabase)
- OTP verification for security (MailGun)

### Web3 Settlement Layer
- Onchain obligation recording - Tab Creation (Movement)
- USDC settlements with finality guarantees
- Gas-sponsored transactions (Shinami)
- Transparent, immutable payment history
- Optional penalty enforcement

### Social Trust Infrastructure
- Friends-only obligation creation
- Public trust scores (pays early/late/on-time)
- Reputation that travels with users
- Nudge-based reminders vs forced liquidation
- Group messaging for coordination

---

## Core Services

### 1. Authentication Service

**Objective**: Provide secure, Web2-friendly authentication with blockchain wallet abstraction.

**Implementation**:
- **Privy Integration**: Email and social OAuth login flows
- **Wallet Abstraction**: Automatic embedded wallet creation on signup
- **Session Management**: JWT-based sessions with refresh token rotation from Privy to be used for CRUD operations with GhostTab Web2 BackEnd
- **Anti-Spam**: Mandatory OTP confirmation through MailGun before tab creation permissions

**Technical Flow**:
```
User Sign Up → Privy OAuth → Email OTP  → Wallet Creation → 
Session Token → Privy User Record → Tab Creation Enabled → Settlement Onchain → Trust Signal Updated
```

**Security Features**:
- Rate-limited OTP requests (5 per hour)
- Automatic session expiry from Privy (7 days)

---

### 2. Identity & Trust Service

**Objective**: Build portable, transparent reputation based on actual payment behavior.

**Trust Score Calculation (Offchain)**:
```typescript
interface TrustMetrics {
  settlements_late: number;
  settlements_on_time: number;
  total_settlements: number;
  avg_settlements_days: number;
  trust_score: number;
}

enum TrustRating {
  EXCELLENT = "pays-early",      // 80%+ early settlements
  GOOD = "pays-on-time",          // 70%+ on-time settlements
  FAIR = "sometimes-late",        // 50-70% on-time
  POOR = "often-late"             // <50% on-time
}
```

**Data Sources**:
- Onchain tab creation and settlement (Movement)
- Mirrored Offchain tab and settlement data (Supabase)
- Penalty enforcement logic (smart contract)
- User self-reported early settlements

**Privacy Considerations**:
- Trust scores are public by design (social accountability)
- Individual tab amounts remain tie to addresses and not user email onchain
- Only aggregate statistics displayed

---

### 3. Friends & Social Graph Service

**Objective**: Ensure all financial obligations occur within verified social relationships.

**Friend Management (Supabase)**:
```typescript
enum FriendshipStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  CANCELLED = "cancelled"
}

interface Friendship {
  id: string;
  userId: string;
  friend_id: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

**Workflow**:
1. **Send Request**: User A sends request to User B (email lookup)
2. **Notification**: User B receives in-app notification
3. **Accept/Decline**: User B takes action
4. **Bidirectional Access**: Both users can now add each other to tabs
5. **Revocation**: Either user can unfriend (doesn't affect existing tabs)

**Anti-Abuse Mechanisms**:
- Rate-limited friend requests (10 per day)
- Mutual acceptance required
- Report/block functionality
- Audit trail for all friendship state changes

---

### 4. Group Management Service

**Objective**: Enable multi-member expense coordination with onchain and offchain state synchronization.

**Group Architecture**:
```typescript
interface Group {
  id: string;                    // UUID
  name: string;
  description: string;
  icon: string;
  stream_channel_id: string;
  creatorId: string;
  memberIds: string[];       // Movement contract address
  createdAt: Date;
}

interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: "admin" | "member";
  joinedAt: Date;
}
```

**Dual-State Recording**:

| State | Storage | Purpose |
|-------|---------|---------|
| Group Metadata | Supabase | Name, description, avatar, settings |
| Member List | Supabase | Current members, roles, join dates |

**Features**:
- **Group Chat**: Real-time messaging via GetStream.io
- **Member Management**: Add/remove members (admin only)
- **Shared Tab Creation**: Any member can create group tabs
- **Activity Feed**: Chronological view of all group tabs
- **Settings**: Customize default penalty rates, settlement reminders

**GetStream.io Integration**:
```typescript
// Initialize group channel
const channel = client.channel('messaging', groupId, {
  name: group.name,
  members: group.memberIds,
  created_by_id: group.creatorId,
});

await channel.watch();
```

---

### 5. Tab & Obligation Service

**Objective**: Create, track, and manage financial obligations with dual onchain/offchain recording.

**Tab Types**:

1. **Standalone Tab**: Single obligation between two/more users
2. **Group Tab**: Shared expense among current group members

**Tab Schema**:
```typescript
interface tab {
  id: string;
  category: string;
  creator_id: string;
  groupId?: string;
  title: string;
  description: string;
  total_amount: bigint;
  penalty_rate?: number;           // Basis points (e.g., 500 = 5%)
  dueDate?: Date;
  status: TabStatus;
  createdAt: Date;
  settledAt?: Date;
}

interface tab_participants {
  id: string;
  share_amount: bigint;
  paid: boolean;
  paid_amount: bigint;
  paid_tx_hash: bigint;
  paid_at: Date;
  created_at: Date;
}

enum TabStatus {
  ACTIVE = "active",
  FULLY_SETTLED = "fully_settled",
}
```

**Creation Flow**:
```
1. User initiates tab creation in UI
2. Frontend validates: creator is friends with all members
3. OTP check: user enters OTP provided by tab participants (members)
4. Transaction constructed: TabManager.createTab(...)
4. Transaction and submitted to BE: Backend confirms that members are friends with the creator and that provided OTP matches saved OTP.
5. Shinami sponsors gas, tx submitted to Movement
6. Onchain event emitted: TabCreated(tabId, creator, members)
7. Backend listener catches event → writes to Supabase
8. Real-time update propagated to all member UIs
9. Notifications sent via In-app
```

**Penalty Mechanism**:
```move
 // Calculate penalty if past deadline
    let penalty = 0u64;
    if (current_time > tab.settlement_deadline && tab.penalty_rate > 0) {
        let days_late = (current_time - tab.settlement_deadline) / 86400; // seconds per day
        penalty = (member.share_amount * tab.penalty_rate * days_late) / 10000; // penalty_rate in basis points
    };
    
    let total_payment = amount + penalty;
```

**Offchain vs Onchain State**:

| Data | Storage | Reason |
|------|---------|--------|
| Tab Creation (title, desc, participants, amounts) | OnChain | Financially critical |
| Tab metadata (title, desc) | Supabase | Frequent updates, not financially critical |
| Obligations & amounts | Both | Supabase for UX, Movement for finality |
| Settlement status | Both | Real-time UI updates + onchain proof |
| Penalty calculations | Movement | Financial enforcement requires onchain |
| Chat messages | GetStream | Ephemeral, not part of financial record |

---

### 6. Settlement Service

**Objective**: Enable any tab member to trigger USDC settlement onchain with automatic penalty enforcement.


**Settlement Flow**:
```
1. Member clicks "Settle" in tab details
2. Frontend calculates total owed (principal + penalties)
3. User starts transfer of USDC transaction
4. Settlement transaction constructed and submitted to backend
5. Shinami sponsors gas for SettlementEngine.settle(...)
6. Smart contract:
   a. Verifies member is part of tab
   b. Calculates penalties based on current timestamp
   c. Transfers USDC from signer of transaction to tab initial settler account
   d. Emits Settlement event
7. Backend listener updates Supabase
8. Trust scores recalculated for all payee
9. Notifications sent to all tab members
```

**Smart Contract Snippet**:
```move
 // Transfer USDC from payer to settler using primary_fungible_store
        primary_fungible_store::transfer(
            account,
            registry.usdc_metadata,
            tab.settler_wallet,
            total_payment
        );
```

**Shinami Gas Sponsorship**:
```typescript
// Shinami BE integration
export async function sponsorTransaction(transactionHex, senderAuthHex) {
  try {
    const gasSponsorClient = await getGasStationClient();


    // Deserialize the transaction
    const transactionBytes = Hex.fromHexString(transactionHex).toUint8Array();
    const simpleTx = SimpleTransaction.deserialize(
      new Deserializer(transactionBytes)
    );

    console.log("Deserialized transaction:", {
      sender: simpleTx.rawTransaction.sender.toString(),
      sequenceNumber: simpleTx.rawTransaction.sequence_number.toString(),
      maxGasAmount: simpleTx.rawTransaction.max_gas_amount.toString(),
      gasUnitPrice: simpleTx.rawTransaction.gas_unit_price.toString(),
      expirationTimestampSecs: simpleTx.rawTransaction.expiration_timestamp_secs.toString(),
    });

    // Deserialize the sender authenticator
    const senderAuthBytes = Hex.fromHexString(senderAuthHex).toUint8Array();
    const senderSig = AccountAuthenticator.deserialize(
      new Deserializer(senderAuthBytes)
    );

    
    const result = await gasSponsorClient.sponsorAndSubmitSignedTransaction(
      simpleTx,
      senderSig
    );

    console.log("Transaction submitted successfully:", result);
    return result;

  } catch (error) {
    console.error("Error in sponsorTransaction:", error);
    
    throw error;
  }
}
```

**Key Features**:
- **Full Settlements**: Can settle individual obligations within a tab
- **Automatic Penalty Calculation**: Based on due date and penalty rate
- **Atomic**: Either all transfers succeed or entire tx reverts
- **Zero Gas**: User only needs USDC, no native tokens required

---

### 7. Penalty & Incentives Service

**Objective**: Encourage timely payments through optional, transparent penalty mechanisms without aggressive liquidation.

**Penalty Design Principles**:
1. **Opt-In**: Penalties are set at tab creation, not enforced globally
2. **Transparent**: All members see penalty terms before accepting tab
3. **Proportional**: Penalties scale with days late, capped at reasonable maximum
4. **Non-Aggressive**: No forced liquidation or collateral seizure
5. **Reputation Impact**: Late payments hurt trust score more than penalties

**Penalty Configuration**:
```typescript
interface PenaltyConfig {
  enabled: boolean;
  rate: number;              // Basis points per day (e.g., 100 = 1%/day)
  maxPenalty: number;        // Cap as % of principal (e.g., 50%)
  gracePeriodDays: number;   // Days before penalties start accruing
}

// Example: $100 tab, 1% daily penalty, 3-day grace
// Day 0-3: No penalty
// Day 4: $1 penalty
// Day 5: $2 penalty
// ...
// Day 53+: $50 penalty (50% cap reached)
```

**Use Cases**:
- **Roommate Rent**: 2% daily penalty after 5-day grace (strong incentive)
- **Dinner Split**: No penalty (casual, trust-based)
- **Recurring Bills**: 0.5% daily with 7-day grace (gentle nudge)
- **Large Expenses**: 1% daily, 25% cap (balanced approach)

---

### 8. Messaging & Notifications Service

**Objective**: Keep members informed and coordinated through contextual, non-intrusive notifications.

**Messaging Architecture** (GetStream.io):
```typescript
// Channel types
enum ChannelType {
  GROUP = "messaging",           // Group chat
  TAB_THREAD = "tab_discussion", // Tab-specific discussions
  DM = "direct_message"          // Friend-to-friend chat
}

// Message structure
interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  attachments?: Attachment[];
  metadata?: {
    tabId?: string;
    settlementId?: string;
    action?: "tab_created" | "settlement_made";
  };
  createdAt: Date;
}
```

**Notification Types**:

| Event | Trigger | Channels | Frequency |
|-------|---------|----------|-----------|
| Tab Created | New tab created | In-app | Immediate |
| Payment Due Soon | 24h before due date | In-app, Push | Once |
| Payment Overdue | Day after due date | In-app, Email, Push | Daily |
| Penalty Accruing | First penalty day | In-app, Email | Once |
| Settlement Made | Any member settles | In-app, Push | Immediate |
| Friend Request | New request received | In-app, Email | Immediate |
| Trust Score Updated | After settlement | In-app | Once |


**Smart Notification Logic**:
- **Time-Based**: Reminders sent at optimal times
- **Frequency Capping**: Max 2 notifications per tab per day
- **User Preferences**: Respect do-not-disturb hours
- **Progressive Urgency**: Tone shifts from gentle reminder → urgent warning
- **Actionable**: Deep links directly to settlement screen

---

## Technical Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile App Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ React Native │  │  NativeWind  │  │  Expo Router         │  │
│  │  Components  │  │   Styling    │  │  Navigation          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Orchestration                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Privy   │  │ Supabase │  │GetStream │  │   Shinami    │   │
│  │   Auth   │  │Realtime  │  │  Chat    │  │Gas Sponsorship│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Supabase   │    │ Movement Testnet │    │ GetStream.io │
│   Database   │◄───┤  Smart Contracts │───►│  Chat Server │
│              │    │                  │    │              │
│  - Users     │    │  - TabCreation   │    │  - Channels  │
│  - Friends   │                            │  - Messages  │
│  - Groups    │    │  - Settlement    │    │  - Threads   │
│  - Tabs      │                            │              │
└──────────────┘    └──────────────────┘    └──────────────┘
```

### Data Flow: Tab Creation
```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Create Tab
     ▼
┌─────────────────┐
│  Mobile App     │
│  Validation:    │
│  - Friends only │
│  - OTP verified │
└────┬────────────┘
     │ 2. Build Transaction
     ▼
┌─────────────────┐
│  Shinami SDK    │
│  Gas Sponsor    │
└────┬────────────┘
     │ 3. Sponsored TX
     ▼
┌─────────────────────┐
│ Movement Testnet    │
│ TabManager.create() │
│ Emit: TabCreated    │
└────┬────────────────┘
     │ 4. Event
     ▼
┌─────────────────┐      ┌──────────────┐
│  Event Listener │─────►│  Supabase    │
│  (Backend)      │      │  Write Tab   │
└─────────────────┘      └──────┬───────┘
                                │ 5. Realtime
                                ▼
                         ┌──────────────┐
                         │  All Clients │
                         │  UI Update   │
                         └──────────────┘
```

### Database Schema (Supabase)
```sql
CREATE TABLE public.friendships (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status USER-DEFINED DEFAULT 'PENDING'::friendship_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id text NOT NULL,
  friend_id text NOT NULL,
  CONSTRAINT friendships_pkey PRIMARY KEY (id),
  CONSTRAINT friendships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT friendships_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id)
);
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  group_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'MEMBER'::group_role,
  joined_at timestamp with time zone DEFAULT now(),
  user_id text NOT NULL,
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.user_groups(id),
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  user_id text NOT NULL,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.otp_codes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  code text NOT NULL,
  type text NOT NULL,
  metadata jsonb,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT otp_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.settlement_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tab_id uuid,
  settled_on_time boolean NOT NULL,
  days_late integer DEFAULT 0,
  penalty_amount numeric,
  trust_score_before integer,
  trust_score_after integer,
  created_at timestamp with time zone DEFAULT now(),
  user_id text NOT NULL,
  CONSTRAINT settlement_history_pkey PRIMARY KEY (id),
  CONSTRAINT settlement_history_tab_id_fkey FOREIGN KEY (tab_id) REFERENCES public.tabs(id),
  CONSTRAINT settlement_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tab_participants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tab_id uuid,
  share_amount numeric NOT NULL CHECK (share_amount >= 0::numeric),
  paid boolean DEFAULT false,
  paid_amount numeric DEFAULT 0 CHECK (paid_amount >= 0::numeric),
  paid_tx_hash text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  settled_early boolean DEFAULT false,
  days_late integer DEFAULT 0,
  penalty_amount numeric DEFAULT 0,
  final_amount numeric,
  verified boolean DEFAULT false,
  otp_sent_at timestamp with time zone,
  verification_deadline timestamp with time zone,
  user_id text NOT NULL,
  last_reminder_sent_at timestamp with time zone,
  reminder_count integer DEFAULT 0,
  CONSTRAINT tab_participants_pkey PRIMARY KEY (id),
  CONSTRAINT tab_participants_tab_id_fkey FOREIGN KEY (tab_id) REFERENCES public.tabs(id),
  CONSTRAINT tab_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tabs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  total_amount numeric NOT NULL CHECK (total_amount > 0::numeric),
  currency text DEFAULT 'MOVE'::text,
  status USER-DEFINED DEFAULT 'OPEN'::tab_status,
  stream_channel_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  settlement_deadline timestamp with time zone CHECK (settlement_deadline >= (CURRENT_TIMESTAMP + '1 day'::interval) AND settlement_deadline <= (CURRENT_TIMESTAMP + '30 days'::interval)),
  penalty_rate numeric DEFAULT 5.00,
  auto_settle_enabled boolean DEFAULT false,
  category USER-DEFINED DEFAULT 'OTHER'::tab_category,
  group_id uuid,
  creator_id text NOT NULL,
  settlement_wallet text NOT NULL,
  CONSTRAINT tabs_pkey PRIMARY KEY (id),
  CONSTRAINT tabs_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.user_groups(id),
  CONSTRAINT tabs_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tab_id uuid,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  currency text DEFAULT 'MOVE'::text,
  tx_hash text NOT NULL UNIQUE,
  type USER-DEFINED NOT NULL,
  status text DEFAULT 'PENDING'::text,
  created_at timestamp with time zone DEFAULT now(),
  from_user_id text,
  to_user_id text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_tab_id_fkey FOREIGN KEY (tab_id) REFERENCES public.tabs(id),
  CONSTRAINT transactions_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id),
  CONSTRAINT transactions_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_groups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  icon text,
  stream_channel_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  creator_id text NOT NULL,
  CONSTRAINT user_groups_pkey PRIMARY KEY (id),
  CONSTRAINT user_groups_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  wallet_address text NOT NULL UNIQUE,
  username text,
  email text UNIQUE,
  phone text,
  avatar_url text,
  auto_settle boolean DEFAULT false,
  vault_address text,
  stream_token text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  trust_score integer DEFAULT 100,
  settlements_on_time integer DEFAULT 0,
  settlements_late integer DEFAULT 0,
  total_settlements integer DEFAULT 0,
  avg_settlement_days numeric,
  id text NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

### Smart Contract Architecture

**Contract Structure**:
```
Movement Testnet
│
├── Tab Creation and Fetching Details
│   ├── createTab(members, amounts, dueDate, penaltyRate)
│   └── getTabDetails(tabId)
│
├── SettlementEngine 
│   ├── settleTab(tabId)
│   ├── calculate Amount and Penalty
│   └── settleObligation
│
└──
```

---

## Tech Stack

### Frontend (Mobile)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.74.x | Cross-platform mobile framework |
| **Expo** | SDK 51 | Development platform & build tools |
| **NativeWind** | 4.0.x | Tailwind CSS for React Native |
| **Expo Router** | 3.x | File-based navigation |
| **TypeScript** | 5.3.x | Type safety |
| **Zustand** | 4.5.x | Global state management |
| **React Query** | 5.x | Server state & caching |
| **Expo Notifications** | - | Push notifications |

### Backend Services

| Service | Purpose | Key Features |
|---------|---------|--------------|
| **Supabase** | Database & Realtime | Postgres, Realtime subscriptions, RLS |
| **Privy** | Authentication | Embedded wallets, OAuth, session mgmt |
| **MailGun** | Email delivery | OTP sending, transactional emails |
| **GetStream.io** | Messaging | Group chat, threads, reactions |
| **Shinami** | Gas sponsorship | Gasless transactions on Movement |

### Blockchain

| Technology | Purpose |
|------------|---------|
| **Movement Testnet** | L2 execution layer |
| **USDC** | Settlement currency |
| **Ethers.js** | Web3 library |
| **Wagmi** | React hooks for Ethereum |

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
```bash
# Required
Node.js >= 18.x
npm >= 9.x or yarn >= 1.22.x

# Recommended
Expo CLI (installed globally)
npm install -g expo-cli

# Development devices
iOS Simulator (macOS only)
Android Emulator (Android Studio)
# OR physical device with Expo Go app
```

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/ghosttab.git
cd ghosttab
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials: Backend
```env

# Privy Configuration
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
PRIVY_VERIFICATION_KEY=your_privy_verification_key

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Redis Configuration (Local)
REDIS_URL=redis://localhost:6379

# GetStream Configuration
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Movement Network Configuration
MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1
MOVEMENT_CHAIN_ID=250
MOVEMENT_USDC_ADDRESS=0xb89077cfd2a82a0c1450534d49cfd5f2707643155273069bc23a912bcfefdee7
TAB_MANAGER_PRIVATE_KEY=your_tab_manager_private_key

# Resend Email Configuration
# RESEND_API_KEY=your_resend_api_key

# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_SANDBOX_DOMAIN=your_mailgun_sandbox_domain

# Shinami Gas Station Configuration
GAS_STATION_ACCESS_KEY=your_shinami_gas_station_access_key

# Service Ports
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
TAB_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
CHAT_SERVICE_PORT=3005

# Environment
NODE_ENV=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,exp://localhost:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

```


Edit `.env` with your credentials: Frontend
```env

# Privy Configuration
PRIVY_APP_ID=your_privy_app_id
PRIVY_CLIENT_ID=your_privy_client_id

```

4. **Deploy smart contracts** (if not already deployed):
```bash
cd contracts
npm install
movement build
movemment move publish
```

6. **Start the development server**:
```bash
npx expo start
```

### Running on Devices

**iOS Simulator** (macOS only):
```bash
npx expo start --ios
# or press 'i' in the Expo terminal
```

**Android Emulator**:
```bash
npx expo start --android
# or press 'a' in the Expo terminal
```

**Physical Device**:
1. Install **Expo Go** from App Store or Google Play
2. Scan QR code shown in terminal
3. App will load on your device

---

## Development

### Project Structure
ghosttab/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication flow
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── verify-otp.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── home.tsx
│   │   ├── friends.tsx
│   │   ├── groups.tsx
│   │   └── profile.tsx
│   ├── tab/
│   │   ├── [id].tsx         # Tab details
│   │   └── create.tsx       # Create new tab
│   └── _layout.tsx
│
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── Tab/
│   │   │   ├── TabCard.tsx
│   │   │   ├── TabList.tsx
│   │   │   └── ObligationItem.tsx
│   │   └── Group/
│   │       ├── GroupCard.tsx
│   │       └── MemberList.tsx
│   │
│   ├── services/            # API & blockchain services
│   │   ├── supabase.ts     # Supabase client
│   │   ├── privy.ts        # Authentication
│   │   ├── blockchain.ts   # Web3 interactions
│   │   ├── getstream.ts    # Chat service
│   │   └── notifications.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTabs.ts
│   │   ├── useGroups.ts
│   │   ├── useFriends.ts
│   │   └── useContract.ts
│   │
│   ├── store/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── tabStore.ts
│   │   └── uiStore.ts
│   │
│   ├── utils/               # Helper functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── dates.ts
│   │   └── blockchain.ts
│   │
│   └── types/               # TypeScript definitions
│       ├── tab.ts
│       ├── user.ts
│       ├── group.ts
│       └── contracts.ts
│
├── contracts/               # Smart contracts
│   ├── TabManager.sol
│   ├── GroupManager.sol
│   ├── SettlementEngine.sol
│   └── TrustScore.sol
│
├── supabase/
│   ├── migrations/         # Database migrations
│   └── seed.sql           # Seed data
│
├── assets/                 # Static assets
│   ├── images/
│   └── fonts/
│
├── .env.example
├── app.json               # Expo configuration
├── package.json
└── tsconfig.json


### Styling with NativeWind

NativeWind provides Tailwind-style utility classes for React Native:
```tsx
// src/components/Tab/TabCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { formatUSDC, formatDate } from '../../utils/formatting';

export function TabCard({ tab, onPress }) {
  const isOverdue = new Date(tab.due_date) < new Date();
  
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      onPress={onPress}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-900">
          {tab.title}
        </Text>
        <View className={`px-3 py-1 rounded-full ${
          tab.status === 'active' ? 'bg-green-100' :
          tab.status === 'fully_settled' ? 'bg-gray-100' :
          'bg-yellow-100'
        }`}>
          <Text className={`text-xs font-semibold ${
            tab.status === 'active' ? 'text-green-700' :
            tab.status === 'fully_settled' ? 'text-gray-700' :
            'text-yellow-700'
          }`}>
            {tab.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      {/* Amount */}
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        ${formatUSDC(tab.total_amount)}
      </Text>
      
      {/* Due Date */}
      <View className="flex-row items-center">
        <Text className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          Due {formatDate(tab.due_date)}
        </Text>
        {isOverdue && (
          <View className="ml-2 px-2 py-0.5 bg-red-100 rounded">
            <Text className="text-xs font-semibold text-red-700">
              OVERDUE
            </Text>
          </View>
        )}
      </View>
      
      {/* Members */}
      <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-500">
          {tab.obligations.length} {tab.obligations.length === 1 ? 'member' : 'members'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
```

---

## Deployment

### Building for Production

#### iOS
```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**app.json** configuration:
```json
{
  "expo": {
    "name": "GhostTab",
    "slug": "ghosttab",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.ghosttab.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "GhostTab needs access to your camera for profile photos",
        "NSPhotoLibraryUsageDescription": "GhostTab needs access to your photo library"
      }
    }
  }
}
```

#### Android
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

**app.json** configuration:
```json
{
  "expo": {
    "android": {
      "package": "com.ghosttab.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### Contract Deployment
```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Movement testnet
npx hardhat run scripts/deploy.ts --network movement-testnet

# Verify contracts
npx hardhat verify --network movement-testnet \
  DEPLOYED_CONTRACT_ADDRESS \
  "CONSTRUCTOR_ARG_1" "CONSTRUCTOR_ARG_2"
```

**hardhat.config.ts**:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "movement-testnet": {
      url: "https://mevm.testnet.movementlabs.xyz",
      chainId: 30732,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      "movement-testnet": process.env.MOVEMENT_EXPLORER_API_KEY,
    },
  },
};

export default config;
```

---

## API Reference

### Supabase Tables

#### Users
```typescript
interface User {
  id: string;
  privy_id: string;
  wallet_address: string;
  email?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  email_verified: boolean;
  trust_score_rating: 'new' | 'pays-early' | 'pays-on-time' | 'sometimes-late' | 'often-late';
  total_tabs_created: number;
  total_tabs_settled: number;
  settled_on_time: number;
  settled_early: number;
  settled_late: number;
  created_at: Date;
  updated_at: Date;
}
```

#### Tabs
```typescript
interface Tab {
  id: string;
  type: 'standalone' | 'group';
  title: string;
  description?: string;
  creator_id: string;
  group_id?: string;
  total_amount: bigint;
  penalty_rate?: number;
  due_date?: Date;
  onchain_tab_id: bigint;
  status: 'active' | 'partially_settled' | 'fully_settled' | 'cancelled';
  created_at: Date;
  settled_at?: Date;
  updated_at: Date;
  
  // Relations
  creator: User;
  group?: Group;
  obligations: Obligation[];
}
```


### GetStream.io Channels
```typescript
// Initialize client
const client = StreamChat.getInstance(API_KEY);

// Create group channel
const channel = client.channel('messaging', groupId, {
  name: 'Group Name',
  members: [userId1, userId2],
  created_by_id: creatorId,
});

// Send message
await channel.sendMessage({
  text: 'Hey everyone!',
  user_id: currentUserId,
});

// Listen for new messages
channel.on('message.new', (event) => {
  console.log('New message:', event.message);
});
```

---

## Contributing

We welcome contributions from the community! Please follow these guidelines:

### Code Style

- **TypeScript**: Use strict type checking
- **ESLint**: Run `npm run lint` before committing
- **Prettier**: Format with `npm run format`
- **Naming Conventions**:
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case

---

## Security

### Current Status

⚠️ **GhostTab is in active development on testnet**

- Smart contracts are **NOT audited**
- Use **testnet funds only**
- **Do not** use real money



Reporting Vulnerabilities
If you discover a security issue:

Do not open a public issue
Email: gr4yha7@protonmail.com
Include:

Description of vulnerability
Steps to reproduce
Potential impact
Suggested fix (if any)



We'll respond within 48 hours and keep you updated on the fix.

Roadmap
Phase 1: Testnet Launch ✅ (Current)

 Core tab creation and settlement
 Friends management
 Group functionality
 Messaging functionality for tab members
 Trust score system
 Gas sponsorship via Shinami
 Mobile app

Phase 2: Enhanced UX (Q2 2026)

 Recurring tabs automation
 Multi-currency support (other stablecoins)
 Export financial reports
 Calendar integration

Phase 3: Mainnet (Q2 2026)

 Full smart contract audit
 Mainnet deployment on Movement
 Insurance/protection mechanisms
 Advanced penalty structures
 Cross-chain settlement support
 Institutional group features

Phase 4: Expansion (Q3 2026)

 GhostTab Marketing and Growth Expansion


FAQ
Q: Do I need cryptocurrency to use GhostTab?
A: You only need USDC to settle tabs. All gas fees are sponsored by Shinami, so you don't need native Movement tokens.
Q: What happens if I lose my phone?
A: Your wallet is managed by Privy and can be recovered via email. Your tab history is stored onchain and mirrored in Supabase and linked to your account.
Q: Can I delete a tab after creating it?
A: Tabs can be cancelled before settlement, but the onchain record remains (for transparency). Offchain data can be hidden from your view.
Q: How are penalties enforced?
A: Penalties are calculated automatically by the smart contract when a tab is settled. They're only enforced if configured at tab creation.
Q: Is my financial data private?
A: Tab amounts are private. Only trust score aggregates (% on-time, etc.) are public. Individual tab details are only visible to members.
Q: What if someone refuses to pay?
A: GhostTab uses social pressure (trust scores, notifications) rather than forced liquidation. Persistent non-payers will have poor trust scores visible to all users.

License
MIT License
Copyright (c) 2025 GhostTab
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Acknowledgments
Built with ❤️ using:

Movement Labs - L2 blockchain infrastructure
Privy - Embedded wallet authentication
Shinami - Gasless transaction sponsorship
Supabase - Backend-as-a-service
GetStream.io - Chat infrastructure
MailGun - Email delivery
Expo - React Native development platform

Special thanks to the Movement community and hackathon participants.

Contact

GitHub: https://github.com/gr4yha7/GhostTab


<div align="center">
Built for Movement M1 Hackathon 2025
</div>
```
