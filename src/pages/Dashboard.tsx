import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { apiFetch } from "@/lib/api";
import { Building2, Users, ClipboardList, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const PIE_COLORS = ["#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b"]; // Violet, Sky, Emerald, Amber

function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [recentAsm, setRecentAsm] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companiesData, assessmentsData] = await Promise.all([
          apiFetch("/companies"),
          apiFetch("/assessments/recent")
        ]);
        setCompanies(companiesData);
        setRecentAsm(assessmentsData);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard analytics...</p>
      </div>
    );
  }

  const stats = {
    totalCompanies: companies.length,
    totalEmployees: companies.reduce((acc, c) => acc + (c.employeeCount || 0), 0),
    testsCompleted: companies.reduce((acc, c) => acc + (c.testsCompleted || 0), 0),
    testsPending: companies.reduce((acc, c) => acc + (c.testsPending || 0), 0),
    avgScore: Math.round(companies.reduce((acc, c) => acc + (c.avgScore || 0), 0) / (companies.length || 1))
  };

  const classificationData = [
    { name: "HiPo", value: recentAsm.filter(a => a.classification === "High Potential (HiPo)").length },
    { name: "Average", value: recentAsm.filter(a => a.classification === "Average Performer").length },
    { name: "Risk", value: recentAsm.filter(a => a.classification === "Risk Candidate").length },
  ];

  const companyChartData = companies.map(c => ({
    name: c.name.length > 10 ? c.name.substring(0, 8) + "..." : c.name,
    score: c.avgScore,
  })).slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Super Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Complete platform overview across all companies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Companies" value={stats.totalCompanies} icon={Building2} color="bg-violet" />
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="bg-sky" />
        <StatCard title="Tests Completed" value={stats.testsCompleted} icon={ClipboardList} subtitle={`${stats.testsPending} pending`} color="bg-emerald" />
        <StatCard title="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} color="bg-violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-base">Company Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={companyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Employee Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={classificationData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {classificationData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {classificationData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAsm.map(asm => (
              <div key={asm.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {asm.name?.split(" ").map((n: string) => n[0]).join("") || "??"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{asm.name || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">{asm.companyName || "Unknown Company"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold">{asm.overallScore}%</p>
                  </div>
                  <Badge variant={asm.classification === "High Potential (HiPo)" ? "default" : asm.classification === "Risk Candidate" ? "destructive" : "secondary"} className="text-xs">
                    {asm.classification === "High Potential (HiPo)" ? "HiPo" : asm.classification === "Risk Candidate" ? "Risk" : "Avg"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <SuperAdminDashboard />
    </DashboardLayout>
  );
}
