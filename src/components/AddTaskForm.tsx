import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const taskSchema = z.object({
  title: z.string().trim().min(1, { message: "Task title is required" }).max(200, { message: "Title must be less than 200 characters" }),
  description: z.string().trim().max(1000, { message: "Description must be less than 1000 characters" }),
});

interface AddTaskFormProps {
  onAdd: (title: string, description: string) => Promise<void>;
}

export const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = taskSchema.parse({ title, description });
      setLoading(true);
      await onAdd(validatedData.title, validatedData.description);
      setTitle("");
      setDescription("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-4 space-y-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="font-medium"
        required
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add details (optional)"
        className="resize-none"
        rows={2}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        <Plus className="w-4 h-4 mr-2" />
        Add Task
      </Button>
    </form>
  );
};