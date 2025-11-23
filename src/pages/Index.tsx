import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskItem } from "@/components/TaskItem";
import { LogOut, ListTodo } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        setTimeout(() => {
          fetchTasks();
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        fetchTasks();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title: string, description: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ title, description, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setTasks([data, ...tasks]);
      toast.success("Task added!");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", id);

      if (error) throw error;
      setTasks(tasks.map((t) => (t.id === id ? { ...t, completed } : t)));
      toast.success(completed ? "Task completed!" : "Task marked incomplete");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleUpdateTask = async (id: string, title: string, description: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title, description })
        .eq("id", id);

      if (error) throw error;
      setTasks(tasks.map((t) => (t.id === id ? { ...t, title, description } : t)));
      toast.success("Task updated!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ListTodo className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <ListTodo className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Task Manager</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          <AddTaskForm onAdd={handleAddTask} />

          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="active">
                Active ({tasks.filter((t) => !t.completed).length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({tasks.filter((t) => t.completed).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">
                    {filter === "all"
                      ? "No tasks yet. Create one to get started!"
                      : filter === "active"
                      ? "No active tasks. Great job!"
                      : "No completed tasks yet."}
                  </p>
                </motion.div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;