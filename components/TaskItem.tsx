"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, PenBox, Save, Tag, Trash2, CalendarDays } from "lucide-react";
import TagBadge from "./TagBadge";
import Link from "next/link";

type Tag = {
  id: number;
  name: string;
  color: string;
};

type Task = {
  id: number;
  text: string;
  done: boolean;
  tags: Tag[];
  description?: string;
  due_date?: string;
};

type Props = {
  task: Task;
  //allTags: Tag[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  //onUpdate: (id: number, newText: string, newDescription?: string, newDueDate?: string) => void;
  //onUpdateTags: (id: number, tagIds: number[]) => void;
};

export default function TaskItem({ task, onToggle, onDelete /*, allTags, onUpdate, onUpdateTags */ }: Props) {
  // const [isEditing, setIsEditing] = useState(false);
  // const [text, setText] = useState(task.text);
  // const [showTagPicker, setShowTagPicker] = useState(false);
  // const [description, setDescription] = useState(task.description ?? "");
  // const [dueDate, setDueDate] = useState(task.due_date?.slice(0, 10) ?? "");
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // function handleSave() {
  //   if (!text.trim()) return;
  //   onUpdate(task.id, text, description, dueDate);
  //   setIsEditing(false);
  // }
  // function toggleTag(tagId: number) {
  //   const currentIds = task.tags.map((t) => t.id);
  //   const newIds = currentIds.includes(tagId) ? currentIds.filter((id) => id !== tagId) : [...currentIds, tagId];
  //   onUpdateTags(task.id, newIds);
  // }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className={`mt-1 text-gray-300 dark:text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <GripVertical size={16} />
        </button>
        {/* Checkbox */}
        <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} className="mt-1 h-4 w-4 rounded accent-indigo-500 cursor-pointer" />
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* {isEditing ? (
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="w-full border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
          ) : ( */}
          <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0 cursor-pointer">
            {
              <p className={`text-sm break-words ${task.done ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"}`}>
                {task.text}
              </p>
            }
            {task.due_date && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                <CalendarDays size={16} className="inline" /> {new Date(task.due_date).toLocaleDateString("pt-BR")}
              </p>
            )}
            {task.description && <p className="text-xs text-indigo-400 mt-1">View details →</p>}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </Link>
          {/* {showTagPicker && allTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {allTags.map((tag) => {
                const active = task.tags.some((t) => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium text-white transition-opacity ${active ? "opacity-100 ring-2 ring-offset-1 ring-gray-400" : "opacity-50 hover:opacity-80"}`}
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )} */}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* <button
            onClick={() => setShowTagPicker(!showTagPicker)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-xs"
            title="Tags"
          >
            <Tag size={16} />
          </button>
          {isEditing ? (
            <button onClick={handleSave} className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-xs">
              <Save size={16} />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xs"
            >
              <PenBox size={16} />
            </button>
          )} */}
          <button
            onClick={() => onDelete(task.id)}
            className={`p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-xs font-bold transition-opacity ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}
