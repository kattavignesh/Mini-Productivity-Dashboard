# Mini Productivity Dashboard

A professional web application designed to track and manage employee activity logs. The system provides a centralized dashboard for monitoring productivity while maintaining strict data privacy through role-based access control.

## Tech Stack

*   **Frontend**: React (with Vite)
*   **Authentication**: Supabase Auth
*   **Database**: Supabase (PostgreSQL)
*   **Routing**: React Router
*   **Icons**: Lucide React
*   **Charts**: Recharts
*   **Styling**: Vanilla CSS with a custom design system

## Features

*   **Secure Authentication**: Email and password-based login powered by Supabase.
*   **Role-Based Access Control (RBAC)**: Distinct permissions for Managers and Employees.
*   **Activity Monitoring**: Interactive dashboard featuring performance charts and detailed activity tables.
*   **Search and Filter**: Tools to quickly find specific tasks, statuses, or team members.
*   **Responsive Design**: A curated, "Stitch-inspired" interface that adapts to different screen sizes.

## Role-Based Access Control

The application enforces data privacy and security through the following logic:

*   **Managers**: Granted a "Global View" to monitor all activity logs across the organization. They have access to team-wide statistics, resource allocation charts, and department directories.
*   **Employees**: Restricted to a "Personal View." They can only access and manage their own activity logs.

**Row Level Security (RLS) is implemented to ensure secure, role-based data access.** This ensures that even at the database level, unauthorized users cannot query or modify data that does not belong to them.

## Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd MiniDashboard
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your Supabase credentials (see the Environment Variables section below).

4.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

## Environment Variables

To connect the application to Supabase, create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Folder Structure

```text
src/
├── components/   # Reusable UI components (ProtectedRoute, Spinner)
├── context/      # Authentication and global state management
├── data/         # Mock data and utility functions for charts
├── lib/          # Supabase client configuration
├── pages/        # Main application views (Dashboard, Login)
├── App.jsx       # Route definitions and provider setup
└── index.css     # Global styles and design system tokens
```

## AI Integration Explanation

In a production environment, a Large Language Model (LLM) such as OpenAI GPT or Google Gemini can be integrated to provide managers with automated weekly summaries.

*   **Process**: A scheduled Supabase Edge Function can be triggered every week to query the latest activity logs.
*   **Summarization**: The logs are formatted into a JSON payload and sent to the LLM with a structured prompt to identify top performers, task completion rates, and workload bottlenecks.
*   **Storage**: The resulting summary is stored in the database and displayed on the manager's dashboard.

**For now, the AI API is not used; however, it can be integrated easily** into the existing "Weekly Summary" architectural panel.