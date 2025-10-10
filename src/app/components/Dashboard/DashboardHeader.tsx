// src/components/Dashboard/DashboardHeader.tsx

// ============================================
// PROPS INTERFACE
// ============================================
interface DashboardHeaderProps {
  title: string
  subtitle: string
}

// ============================================
// DASHBOARD HEADER COMPONENT
// ============================================
// Simple, reusable header component
// You could expand this to include navigation, user profile, etc.
export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-400 mt-2">{subtitle}</p>
      </div>
    </header>
  )
}