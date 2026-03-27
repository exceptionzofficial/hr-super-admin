import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { calculateSectionScores, classifyEmployee, SECTIONS, SECTION_COLORS } from "@/data/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, AlertTriangle, Download } from "lucide-react";
import { generateIndividualReport } from "@/utils/reportGenerator";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts";

export default function Results() {
  const answers: Record<number, number | string> = useMemo(() => {
    const stored = sessionStorage.getItem("testAnswers");
    if (stored) return JSON.parse(stored);
    const demo: Record<number, number | string> = {};
    for (let i = 1; i <= 90; i++) {
      if (i >= 41 && i <= 55) demo[i] = "B";
      else if (i >= 26 && i <= 30) demo[i] = "B";
      else demo[i] = Math.floor(Math.random() * 3) + 3;
    }
    return demo;
  }, []);

  const scores = useMemo(() => calculateSectionScores(answers), [answers]);
  const classification = useMemo(() => classifyEmployee(scores), [scores]);
  const overallPercentage = useMemo(() => {
    const vals = Object.values(scores);
    return Math.round(vals.reduce((s, v) => s + v.percentage, 0) / vals.length);
  }, [scores]);

  const radarData = SECTIONS.map(s => ({ section: s.split(" ")[0], score: scores[s].percentage, fullMark: 100 }));
  const barData = SECTIONS.map(s => ({ name: s.length > 12 ? s.split(" ")[0] : s, score: scores[s].percentage, fill: SECTION_COLORS[s] }));
  const strengths = SECTIONS.filter(s => scores[s].percentage >= 75).sort((a, b) => scores[b].percentage - scores[a].percentage);
  const weaknesses = SECTIONS.filter(s => scores[s].percentage < 50).sort((a, b) => scores[a].percentage - scores[b].percentage);

  const handleDownload = () => {
    generateIndividualReport({
      id: "self", employeeId: "SELF", name: "Test User",
      email: "user@test.com", companyId: "c1", companyName: "My Company",
      testStatus: "completed", overallScore: overallPercentage,
      classification, completedAt: new Date().toLocaleDateString(),
      sectionScores: Object.fromEntries(SECTIONS.map(s => [s, scores[s].percentage])),
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Assessment Results</h1>
            <p className="text-muted-foreground text-sm">Your comprehensive psychometric profile</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-4 py-1.5 ${classification === "High Potential (HiPo)" ? "bg-success/10 text-success border-success/20" : classification === "Risk Candidate" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}`} variant="outline">
              {classification}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">{overallPercentage}</span>
              </div>
              <p className="text-sm font-medium">Overall Score</p>
              <p className="text-xs text-muted-foreground">Out of 100%</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-3" />
              <p className="text-sm font-medium">Top Strength</p>
              <p className="text-xs text-muted-foreground">{strengths[0] || "N/A"}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" />
              <p className="text-sm font-medium">Growth Area</p>
              <p className="text-xs text-muted-foreground">{weaknesses[0] || "None identified"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Competency Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(220, 13%, 91%)" />
                  <PolarAngleAxis dataKey="section" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar dataKey="score" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Section Scores</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Detailed Section Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {SECTIONS.map(section => (
              <div key={section} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{section}</span>
                  <span className="text-sm font-bold" style={{ color: SECTION_COLORS[section] }}>{scores[section].percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${scores[section].percentage}%`, backgroundColor: SECTION_COLORS[section] }} />
                </div>
                <p className="text-xs text-muted-foreground">{scores[section].score} / {scores[section].maxScore} points</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-success" /> Strengths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {strengths.length > 0 ? strengths.map(s => (
                <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-success/5">
                  <span className="text-sm">{s}</span>
                  <Badge variant="outline" className="text-success border-success/20">{scores[s].percentage}%</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">Complete the assessment to see strengths</p>}
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> Areas for Growth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weaknesses.length > 0 ? weaknesses.map(s => (
                <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-warning/5">
                  <span className="text-sm">{s}</span>
                  <Badge variant="outline" className="text-warning border-warning/20">{scores[s].percentage}%</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">No major growth areas identified</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
