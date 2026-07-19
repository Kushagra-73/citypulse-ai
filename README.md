# CityPulse AI 🌆🤖

### *Smart AI-Powered Civic Reporting & Citizen Rewards Platform*

CityPulse AI is a next-generation civic technology platform designed to bridge the gap between citizens and municipal authorities (like the BBMP in Bengaluru). By leveraging multi-modal **AI Image Auditing (Gemini Vision)**, **Geofenced Duplicate Detection**, and a **Gamified Reward System**, CityPulse AI streamlines urban infrastructure reporting and incentivizes active civic participation.

---

## 🚀 Key Features

*   **📷 Redesigned 5-Step Reporting Wizard**:
    *   **Category Grid Selection**: Instantly tag reports under *Road Damage*, *Garbage & Sanitation*, *Water Leakage*, *Broken Streetlight*, *Electricity*, or *Other*.
    *   **Multi-Image Uploads**: Upload up to 5 photos showing different angles of the hazard.
    *   **AI Vision Verification**: An automated audit analyzing image pixels and context to check validity, flagging fake or spam submissions.
    *   **Map Coordinate Marker**: Geolocation locator enabling manual address inputs or visual map pin coordinates.
    *   **Confirm & Publish**: Review all fields and images in a horizontal slider gallery before pushing live.
*   **⚖️ Fraud Protection & Citizen Trust Scores**:
    *   Submitting verified, genuine reports awards **+15 Reward Points** and increases profile **Trust Rating**.
    *   Submitting spam or fake tickets triggers an instant automatic penalty of **-50 Reward Points** and **-15.0% Trust Score** to block bad actors.
*   **📍 Real-Time Duplicate Prevention**:
    *   The location step scans a 200m radius for active issues in the same category, prompting citizens to **"Endorse/Join Complaint"** instead of filing duplicate tickets.
*   **🎁 Gamified Rewards Shop**:
    *   Exchange points for vouchers: weekly bus/metro passes (BMTC/Namma Metro), horticulture seed coupons (Lalbagh Botanical Nursery), museum entrance passes, or tree planting sponsorships (+50 Trust Score).
*   **🇮🇳 Multi-Page Hindi Localization**:
    *   Complete language toggles across Dashboard, Community Feed, Rewards catalog, User Profile, and Settings screens. User profile details (email/names) remain in English.
*   **🎨 Premium Glassmorphic UI**:
    *   Includes rotating floating background gradients (aurora effect), low-poly watermark textures (in light mode), and dynamic dark-grey and black shimmery heading titles.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 15 (React 19), Tailwind CSS, TypeScript, Lucide Icons, React Hot Toast.
*   **Backend & DB**: Firebase Authentication, Cloud Firestore (Real-time NoSQL database), Firebase Storage.
*   **AI Engine**: Google Gemini API (Multi-modal pixel verification and category tagging).

---

## ⚙️ Environment Configuration

To run the application in live mode, create a `.env.local` file in your root folder and configure your Firebase and Gemini credentials:

```env
# Firebase Cloud Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Google Gemini API Configuration
GEMINI_API_KEY="your-gemini-api-key"
```

*Note: If no environment keys are supplied, the application automatically runs in an offline **Local Mock mode** utilizing browser `localStorage` as a fallback database.*

---

## 💻 Local Setup & Run

1.  Clone the repository:
    ```bash
    git clone <your-repo-link>
    cd citypulse-ai
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the local development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:3000` in your web browser.

---

## 🏗️ Production Build

To compile and package the app for static deployment:
```bash
npm run build
```
This runs the TypeScript compiler and exports optimized Next.js page routes.

---

## 📄 Database Collections Schema

### `users`
```json
{
  "uid": "string (Auth ID)",
  "name": "string",
  "email": "string",
  "photo": "string (Avatar URL)",
  "rewardPoints": "number",
  "trustScore": "number (0-100)",
  "reportsCount": "number",
  "joinedDate": "string (ISO)"
}
```

### `reports`
```json
{
  "id": "string (Ticket ID)",
  "title": "string",
  "description": "string",
  "category": "string",
  "severity": "Low | Medium | High",
  "priority": "Low | Medium | High",
  "status": "Submitted | In Progress | Resolved | Rejected",
  "images": ["string (Storage URLs)"],
  "latitude": "number",
  "longitude": "number",
  "address": "string",
  "createdBy": "string (User UID)",
  "creatorName": "string",
  "creatorPhoto": "string",
  "createdAt": "string (ISO)",
  "likes": ["string (User UIDs)"],
  "department": "string",
  "aiSummary": "string",
  "confidence": "number"
}
```
