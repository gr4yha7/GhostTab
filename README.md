# GhostTab Mobile

[![Expo](https://img.shields.io/badge/Expo-54-blue?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.4-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Privy](https://img.shields.io/badge/Auth-Privy-6366f1?style=flat-square)](https://privy.io/)
[![Tailwind](https://img.shields.io/badge/Styling-NativeWind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://nativewind.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

GhostTab is a premium, Venmo + SplitWise-style split payments application built on the **Movement Network**. It offers a seamless, peer-to-peer settlement experience leveraging secure embedded wallets and the high-performance Movement blockchain.

---

## Key Features

- **Split Payments (Tabs)**: Create group or individual tabs to split expenses with friends instantly.
- **Secure Embedded Wallets**: Non-custodial, secure wallets integrated directly into the app via **Privy**.
- **Dynamic Trust Score**: A behavior-based scoring system that rewards prompt settlements with descriptive tiers ("Settles instantly", "Reliable payer").
- **Movement Network Integration**:
  - **Real-time USDC Balances**: Optimized balance fetching via Indexers and direct blockchain view functions.
  - **Low-Cost Settlements**: Instant transactions with sponsored gas fees (via Shinami).
- **Social & Discovery**: Find friends by username or email and chat within specific tabs.
- **Real-time Notifications**: Instant alerts for new invites, payment confirmations, and friend requests.
- **Spending Insights**: Detailed analytics on your spending habits, top categories, and collaboration history.

---

## Tech Stack

- **Framework**: [Expo 54](https://expo.dev/) (React Native 0.81.4)
- **Auth & Wallets**: [Privy Expo SDK](https://docs.privy.io/guide/expo/)
- **State Management**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Styling**: [NativeWind (Tailwind CSS v3)](https://www.nativewind.dev/)
- **Blockchain**: [Viem](https://viem.sh/) for Movement Network interactions
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Icons**: [Ionicons](https://ionic.io/ionicons) & [SimpleLineIcons](https://simplelineicons.github.io/)

---

## Getting Started

### Prerequisites

- **Node.js**: v18 or later
- **Package Manager**: `npm` or `pnpm`
- **Expo Go**: (Optional) For testing on physical devices
- **GhostTab Backend**: Ensure the [ghosttab-backend](../ghosttab-backend) is running.

### 1. Installation

```bash
# Clone the repository
git clone <repository-url> ghost-tab
cd ghost-tab

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
PRIVY_APP_ID=your_privy_app_id
PRIVY_CLIENT_ID=your_privy_client_id
```

*Note: Ensure these values match your Privy Dashboard configuration for the Movement Network.*

### 3. Running the App

```bash
# Start the Expo development server
npx expo start -- --reset-cache
```

- Press **`i`** to open in the iOS Simulator.
- Press **`a`** to open in the Android Emulator.
- Scan the QR code with the Expo Go app on your phone.

---

## Roadmap

- [x] Social Discovery & Friend System
- [ ] **Auto-Settlement**: Opt-in to automatically pay tabs before deadlines.
- [ ] **Group Expense Templates**: Pre-set splits for recurring bills.
- [ ] **Advanced Trust Tier Benefits**: Lower penalty rates for high-score users.

---

## License

Distributed under the MIT License.

---

## Support

GhostTab is built for the Movement Network. For technical issues, please open a GitHub issue or contact the development team.

[Movement Labs](https://movementlabs.xyz/) | [Privy Docs](https://docs.privy.io/) | [GhostTab Backend](https://github.com/gr4yha7/ghosttab-backend)