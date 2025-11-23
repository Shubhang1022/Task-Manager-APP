import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = ({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle, editDescription);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all duration-300"
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            className="font-medium"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            className="resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="secondary" size="sm" className="flex-1">
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id, !task.completed)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium transition-all duration-300 ${
                task.completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};