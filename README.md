# 🎨 DevZen — Personal Productivity & Coding Dashboard

DevZen is an ambient, local-first, glassmorphic productivity workspace built specifically for developers to balance their tasks, track their coding growth, manage expenses, and lock into deep work.

Developed with React, TypeScript, and Tailwind CSS, DevZen is fully responsive and features real-time cloud synchronization to keep laptop and phone views in perfect harmony.

---

## ✨ Key Features

### 1. 💻 LeetCode Tracker & Heatmap
- **Baseline Solves**: Pre-loaded baseline counter (e.g. 553 solves) to easily resume your progress.
- **LeetCode Heatmap**: A month-by-month submission grid spanning **July 2026 to July 2027** showing daily solved consistency.
- **Interactive Inspector**: Inspect any date to see that day's solves, study hours, and check off scheduled tasks directly.
- **Custom Backdating**: Forgot to log yesterday? Log solved problems and revision notes with a custom date selector without breaking today's streak.
- **Growth Curves**: A dual-axis composed chart showing daily solves (bars) alongside your cumulative solved growth curve (glowing yellow gradient area chart) since July 1st.

### 2. 🍏 Finance & Expense Tracker
- **Smart Balance Calculation**: Track your total wallet balance computed as:
  $$\text{Total Balance} = \text{Initial Starting Cash} + \text{Deposit Income} - \text{Spend Expenses}$$
- **Initial Cash Editor**: Click **(edit)** on the Wallet Card to set or adjust your starting cash balance manually.
- **Categorized Purchases**: Log expenses with emojis under dedicated categories:
  - 🍏 **Food** (Meals, Groceries)
  - 🍰 **Dessert** (Chocolate, Biscuits)
  - 🍿 **Snacks** (Lays, Chips)
  - 🎓 **Fees** (College, Exams)
  - 🎁 **Gifts & Presents** (Bday presents)
  - 🛍️ **Essentials** (Daily needs, stationery)
  - 💼 **Other** (Miscellaneous)
- **Day-Wise Timeline**: View chronologically grouped logs showing each day's net transactions.

### 3. ⏱️ Interactive Focus Mode (Study Timer)
- **Stopwatch Mode**: Count up from `00:00` to track open-ended study marathons.
- **Pomodoro Mode**: 25-minute focus countdown timer featuring a smooth pulsing breath animation ring.
- **Subject Picker**: Select what subject you are studying (LeetCode, DBMS, OS, React, College, etc.) or type a custom subject.
- **Auto-Log & Confetti**: Completing your session calculates hours studied, auto-logs it to your stats database, and fires a celebratory screen-wide confetti explosion.

### 4. 🔄 Real-Time Cloud Sync (Supabase)
- **Privacy-First Sync**: Enter your own private Supabase credentials. They save locally in your browser memory and are never shared.
- **No Heavy SDK Bloat**: Connects directly to Supabase's PostgREST database using lightweight browser `fetch` calls.
- **Overwrite Protection Check**: Smart local storage safety checks prevent empty device connections from wiping active data; it automatically pushes data up instead of pulling blank states.

### 5. 🎨 Aesthetic & Responsive Layout
- **GCP-Style Backdrop**: Soft Lilac, Sky Blue, and Sakura Pink gradient circles float in the background, bleeding through frosted panels.
- **Visual Themes**: Toggle between dark and light modes, and customize the active accent highlight color palette.
- **Responsive Drawer**: The sidebar collapses into a slide-in drawer on mobile screens with responsive workspace paddings (`p-4` to `p-8`) to prevent squishing.

---

## 🛠️ Tech Stack
- **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database / API**: [Supabase](https://supabase.com/) REST API

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have Node.js installed on your computer.

### 2. Local Installation
Clone the repository and install the dependencies:
```bash
# Clone the repository
git clone https://github.com/GopikaArumugam/daily-tracker.git

# Navigate into the project folder
cd daily-tracker

# Install dependencies
npm install
```

### 3. Run Locally
Start the local development server:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 4. Build for Production
To build and compile the production bundle:
```bash
npm run build
```

---

## 🚀 Git & Deployment Workflow

DevZen is set up with automatic deployment via **Vercel**. Every time you push changes to your GitHub repository, Vercel automatically detects the commit, recompiles the application, and deploys it live.

### How to push local updates to your live site:

1. **Check status of changes**:
   Make sure you are in the `daily-tracker` folder, and check which files were modified:
   ```bash
   git status
   ```

2. **Stage your changes**:
   Add all modified or new files to the staging area:
   ```bash
   git add .
   ```

3. **Commit your changes**:
   Create a commit with a descriptive message of what you updated:
   ```bash
   git commit -m "feat: customize style and add sync configurations"
   ```

4. **Push to GitHub**:
   Push the changes to your main branch. Vercel will immediately start building the new deployment in the background:
   ```bash
   git push origin main
   ```

Within 30–45 seconds, your Vercel URL (e.g. `daily-tracker-mauve-six.vercel.app`) will be updated automatically!

---

## 🔄 How to Set Up Supabase Cloud Sync

To sync your laptop and phone automatically in real-time, configure your own private database in 3 quick steps:

### Step A: Create your Supabase Table
1. Sign up for a free project at **[supabase.com](https://supabase.com)**.
2. In your Supabase sidebar, open the **SQL Editor** tab (`>_`).
3. Click **New Query**, paste the code below, and click **Run**:
   ```sql
   create table if not exists user_sync (
     id text primary key,
     data jsonb not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Allow anonymous read/write access using anon keys
   alter table user_sync enable row level security;
   create policy "Allow anonymous read/write" on user_sync for all using (true) with check (true);
   ```

### Step B: Copy your Credentials
1. Click the **Project Settings** (gear icon ⚙️) on your Supabase dashboard sidebar.
2. Click **API** under settings.
3. Copy:
   - **Project URL** (e.g. `https://yourid.supabase.co`)
   - **`anon` `public` API Key**

### Step C: Enable Sync in DevZen
1. Go to the **Settings** tab on DevZen.
2. Paste the **Supabase URL** and **Anon API Key** into the Cloud Sync card.
3. Type a private **Sync Code** of your choice (e.g., `gopika-sync-key`).
4. Toggle **Enable Automatic Sync** on.
5. Click **Save Config** and then click **Sync Now**.
6. Repeat Step C on your phone using the exact same Sync Code, and you're fully connected!
