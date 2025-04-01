"use client";

import { useState, useEffect } from "react";

// Task interface to match backend data structure
interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
}

// Initial state for a new task form
const initialTaskState = {
  title: "",
  description: "",
  due_date: "",
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState(initialTaskState);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch all tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // API Functions
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/tasks");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tasks. Is the backend server running?");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          due_date: newTask.due_date || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setNewTask(initialTaskState);
      setError(null);
      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError("Failed to create task");
      console.error("Error creating task:", err);
    }
  };

  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          due_date: editingTask.due_date,
          completed: editingTask.completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setEditingTask(null);
      setError(null);
      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError("Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError("Failed to update task completion status");
      console.error("Error updating task completion:", err);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      fetchTasks(); // Refresh the task list
    } catch (err) {
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingTask) return;
    
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Special handling for checkbox inputs
    const newValue = type === "checkbox" 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setEditingTask((prev) => prev ? { ...prev, [name]: newValue } : null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Task Manager</h1>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <strong>Error: </strong>
          {error}
          <button
            className="absolute top-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Create task form */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <form onSubmit={createTask}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleTaskChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleTaskChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="due_date" className="block text-sm font-medium mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={newTask.due_date}
              onChange={handleTaskChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Create Task
          </button>
        </form>
      </div>

      {/* Task list */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found. Create one to get started!</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id} className="py-4">
                {editingTask?.id === task.id ? (
                  // Edit task form
                  <form onSubmit={updateTask} className="space-y-3">
                    <div>
                      <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="edit-title"
                        name="title"
                        value={editingTask.title}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        name="description"
                        value={editingTask.description || ""}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-due_date" className="block text-sm font-medium mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        id="edit-due_date"
                        name="due_date"
                        value={editingTask.due_date || ""}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-completed"
                        name="completed"
                        checked={editingTask.completed}
                        onChange={handleEditChange}
                        className="mr-2"
                      />
                      <label htmlFor="edit-completed" className="text-sm">
                        Mark as completed
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTask(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // Task view
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task)}
                        className="mr-2 h-5 w-5"
                      />
                      <h3
                        className={`text-lg font-medium ${
                          task.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 ml-7 mb-2">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="text-sm text-gray-500 ml-7 mb-2">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex space-x-2 ml-7">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
