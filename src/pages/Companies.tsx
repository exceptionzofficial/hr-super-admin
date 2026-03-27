import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Retail", "Automotive", "Manufacturing", "Consulting"];

export default function Companies() {
  const navigate = useNavigate();
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", contactEmail: "", industry: "" });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/companies");
      setCompaniesList(data);
    } catch (error) {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const filtered = companiesList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.contactEmail || !newCompany.industry) {
      toast.error("Please fill all fields");
      return;
    }
    
    setAdding(true);
    try {
      const created = await apiFetch("/companies", {
        method: "POST",
        body: JSON.stringify(newCompany)
      });
      toast.success(`Company "${created.name}" added successfully!`);
      setCompaniesList(prev => [...prev, created]);
      setDialogOpen(false);
      setNewCompany({ name: "", contactEmail: "", industry: "" });
    } catch (error) {
      toast.error("Failed to add company");
    } finally {
      setAdding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Companies</h1>
            <p className="text-muted-foreground text-sm">Manage your client companies</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet hover:bg-violet/90 text-white border-0 shadow-md transition-all">
                <Plus className="w-4 h-4 mr-2" /> Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>Register a new client company on the platform</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="e.g., Acme Corporation" value={newCompany.name} onChange={e => setNewCompany(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" placeholder="hr@company.com" value={newCompany.contactEmail} onChange={e => setNewCompany(p => ({ ...p, contactEmail: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={newCompany.industry} onValueChange={v => setNewCompany(p => ({ ...p, industry: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={adding}>Cancel</Button>
                  <Button type="submit" disabled={adding} className="bg-violet hover:bg-violet/90 text-white border-0 shadow-md">
                    {adding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : "Add Company"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search companies..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading companies...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No companies found</p>
            <p className="text-sm">Try adjusting your search or add a new company</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(company => {
              const completion = company.employeeCount > 0 ? Math.round((company.testsCompleted / company.employeeCount) * 100) : 0;
              return (
                <Card
                  key={company.id}
                  className="border-border hover:shadow-glow transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-violet flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">{company.avgScore}% avg</Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">{company.uniqueCode}</p>
                      </div>
                    </div>
                    <CardTitle className="text-base mt-3">{company.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{company.industry}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {company.employeeCount} employees
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">{completion}%</span>
                      </div>
                      <Progress value={completion} className="h-1.5" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{company.testsCompleted} completed</span>
                      <span>{company.testsPending} pending</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
