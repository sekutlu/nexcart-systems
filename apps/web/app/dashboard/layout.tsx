"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import { WithAuth } from "@/components/WithAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WithAuth roles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="db-shell">
        <DashboardSidebar />
        <div className="db-content">{children}</div>
      </div>
    </WithAuth>
  );
}
