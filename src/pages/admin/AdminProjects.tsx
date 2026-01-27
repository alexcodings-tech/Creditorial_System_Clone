// import { useState, useEffect } from "react";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { Plus, Search, Calendar, Users, Loader2 } from "lucide-react";

// type Sector = "Web Development" | "Digital Marketing" | "Content Creation";

// interface ActivityCredit {
//   activity: string;
//   credits: number;
//   sector: string;
// }

// interface Project {
//   id: string;
//   name: string;
//   description: string | null;
//   client_name: string | null;
//   project_type: string;
//   activity: string | null;
//   status: string;
//   start_date: string | null;
//   end_date: string | null;
//   expected_credits: number | null;
//   created_at: string;
// }

// interface Profile {
//   id: string;
//   email: string;
//   full_name: string;
//   role: string;
//   sector: Sector | null;
// }

// export default function AdminProjects() {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [employees, setEmployees] = useState<Profile[]>([]);
//   const [activities, setActivities] = useState<ActivityCredit[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
//   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isCreating, setIsCreating] = useState(false);
//   const { user } = useAuth();
//   const { toast } = useToast();

//   // Form state
//   const [newName, setNewName] = useState("");
//   const [newDescription, setNewDescription] = useState("");
//   const [newClientName, setNewClientName] = useState("");
//   const [newProjectType, setNewProjectType] = useState<Sector>("Web Development");
//   const [newStartDate, setNewStartDate] = useState("");
//   const [newEndDate, setNewEndDate] = useState("");
//   const [newActivity, setNewActivity] = useState("");
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

//   const fetchProjects = async () => {
//     const { data, error } = await supabase
//       .from("projects")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching projects:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load projects",
//         variant: "destructive",
//       });
//     } else {
//       setProjects(data as Project[]);
//     }
//     setLoading(false);
//   };

//   const fetchEmployees = async () => {
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("id, email, full_name, role, sector")
//       .in("role", ["employee", "lead"]);

//     if (error) {
//       console.error("Error fetching employees:", error);
//     } else {
//       setEmployees(data as Profile[]);
//     }
//   };

//   const fetchActivities = async () => {
//     const { data, error } = await supabase
//       .from("activity_credits")
//       .select("*")
//       .order("activity");

//     if (error) {
//       console.error("Error fetching activities:", error);
//     } else {
//       setActivities(data as ActivityCredit[]);
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//     fetchEmployees();
//     fetchActivities();
//   }, []);

//   const handleCreateProject = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!newActivity) {
//       toast({
//         title: "Activity Required",
//         description: "Please select an activity type for this project",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     setIsCreating(true);

//     try {
//       // Credits are auto-calculated by the database trigger based on activity
//       const { error } = await supabase.from("projects").insert({
//         name: newName,
//         description: newDescription || null,
//         client_name: newClientName || null,
//         project_type: newProjectType,
//         activity: newActivity,
//         start_date: newStartDate || null,
//         end_date: newEndDate || null,
//         created_by: user?.id,
//       });

//       if (error) throw error;

//       toast({
//         title: "Success",
//         description: `Project "${newName}" created successfully`,
//       });

//       // Reset form
//       setNewName("");
//       setNewDescription("");
//       setNewClientName("");
//       setNewProjectType("Web Development");
//       setNewActivity("");
//       setNewStartDate("");
//       setNewEndDate("");
//       setIsDialogOpen(false);
//       fetchProjects();
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create project",
//         variant: "destructive",
//       });
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   // Filter activities based on selected project type (sector)
//   const filteredActivities = activities.filter(
//     (act) => act.sector === newProjectType
//   );

//   // Get credits for selected activity (for display purposes)
//   const selectedActivityCredits = activities.find(
//     (act) => act.activity === newActivity
//   )?.credits;

//   const handleAssignEmployee = async () => {
//     if (!selectedProject || !selectedEmployeeId) return;

//     // Validate sector match
//     const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
//     if (!selectedEmployee) return;

//     // Check if employee sector matches project type (sector)
//     if (selectedEmployee.sector !== selectedProject.project_type) {
//       toast({
//         title: "Assignment Blocked",
//         description: `Cannot assign ${selectedEmployee.full_name} (${selectedEmployee.sector || "No sector"}) to a ${selectedProject.project_type} project. Sectors must match.`,
//         variant: "destructive",
//       });
//       console.error(`Assignment validation failed: Employee sector (${selectedEmployee.sector}) does not match project type (${selectedProject.project_type})`);
//       return;
//     }

//     try {
//       const { error } = await supabase.from("project_assignments").insert({
//         project_id: selectedProject.id,
//         employee_id: selectedEmployeeId,
//         assigned_by: user?.id,
//       });

//       if (error) {
//         if (error.code === "23505") {
//           toast({
//             title: "Already Assigned",
//             description: "This employee is already assigned to this project",
//             variant: "destructive",
//           });
//         } else {
//           throw error;
//         }
//       } else {
//         toast({
//           title: "Success",
//           description: "Employee assigned to project successfully",
//         });
//         setIsAssignDialogOpen(false);
//         setSelectedEmployeeId("");
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to assign employee",
//         variant: "destructive",
//       });
//     }
//   };

//   const filteredProjects = projects.filter(
//     (proj) =>
//       proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       proj.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const getStatusBadgeVariant = (status: string) => {
//     switch (status) {
//       case "active":
//         return "default";
//       case "completed":
//         return "secondary";
//       case "on_hold":
//         return "outline";
//       default:
//         return "outline";
//     }
//   };

//   return (
//     <DashboardLayout role="admin">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold font-display text-foreground">Projects</h1>
//             <p className="text-muted-foreground mt-1">Manage and assign projects</p>
//           </div>
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="gap-2 gradient-primary text-primary-foreground shadow-glow">
//                 <Plus className="h-4 w-4" />
//                 Create Project
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>Create New Project</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">Project Name</Label>
//                   <Input
//                     id="name"
//                     placeholder="Q1 Marketing Campaign"
//                     value={newName}
//                     onChange={(e) => setNewName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     placeholder="Project details..."
//                     value={newDescription}
//                     onChange={(e) => setNewDescription(e.target.value)}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="client">Client Name</Label>
//                     <Input
//                       id="client"
//                       placeholder="Client Corp"
//                       value={newClientName}
//                       onChange={(e) => setNewClientName(e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="type">Project Type</Label>
//                     <Select 
//                       value={newProjectType} 
//                       onValueChange={(v) => {
//                         setNewProjectType(v as Sector);
//                         setNewActivity(""); // Reset activity when sector changes
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Web Development">Web Development</SelectItem>
//                         <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
//                         <SelectItem value="Content Creation">Content Creation</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="startDate">Start Date</Label>
//                     <Input
//                       id="startDate"
//                       type="date"
//                       value={newStartDate}
//                       onChange={(e) => setNewStartDate(e.target.value)}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="endDate">End Date</Label>
//                     <Input
//                       id="endDate"
//                       type="date"
//                       value={newEndDate}
//                       onChange={(e) => setNewEndDate(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="activity">Activity Type</Label>
//                   <Select 
//                     value={newActivity} 
//                     onValueChange={setNewActivity}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select an activity" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {filteredActivities.map((act) => (
//                         <SelectItem key={act.activity} value={act.activity}>
//                           {act.activity} ({act.credits} credits)
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {selectedActivityCredits !== undefined && (
//                     <p className="text-sm text-muted-foreground">
//                       Auto-calculated credits: <span className="font-semibold text-foreground">{selectedActivityCredits}</span>
//                     </p>
//                   )}
//                 </div>
//                 <Button
//                   type="submit"
//                   className="w-full gradient-primary text-primary-foreground"
//                   disabled={isCreating}
//                 >
//                   {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Project"}
//                 </Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Search */}
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search projects..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>

//         {/* Table */}
//         <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
//           {loading ? (
//             <div className="flex items-center justify-center h-64">
//               <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Project</TableHead>
//                   <TableHead>Client</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Credits</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredProjects.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
//                       No projects found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredProjects.map((project) => (
//                     <TableRow key={project.id}>
//                       <TableCell>
//                         <div>
//                           <p className="font-medium">{project.name}</p>
//                           {project.end_date && (
//                             <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//                               <Calendar className="h-3 w-3" />
//                               Due: {new Date(project.end_date).toLocaleDateString()}
//                             </p>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-muted-foreground">
//                         {project.client_name || "-"}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="outline">{project.project_type}</Badge>
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={getStatusBadgeVariant(project.status)}>
//                           {project.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="font-semibold">{project.expected_credits}</TableCell>
//                       <TableCell>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="gap-1"
//                           onClick={() => {
//                             setSelectedProject(project);
//                             setIsAssignDialogOpen(true);
//                           }}
//                         >
//                           <Users className="h-3 w-3" />
//                           Assign
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </div>

//         {/* Assign Employee Dialog */}
//         <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Assign Employee to {selectedProject?.name}</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 mt-4">
//               <div className="space-y-2">
//                 <Label>Select Employee</Label>
//                 <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Choose an employee" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {employees
//                       .filter((emp) => emp.sector === selectedProject?.project_type)
//                       .map((emp) => (
//                         <SelectItem key={emp.id} value={emp.id}>
//                           {emp.full_name} ({emp.sector})
//                         </SelectItem>
//                       ))}
//                     {employees.filter((emp) => emp.sector === selectedProject?.project_type).length === 0 && (
//                       <div className="px-2 py-4 text-center text-sm text-muted-foreground">
//                         No employees with matching sector ({selectedProject?.project_type})
//                       </div>
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <Button
//                 onClick={handleAssignEmployee}
//                 className="w-full gradient-primary text-primary-foreground"
//                 disabled={!selectedEmployeeId}
//               >
//                 Assign Employee
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   );
// }
