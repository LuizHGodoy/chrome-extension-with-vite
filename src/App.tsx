import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Calendar, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Task } from "./types/task";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("");
  const [taskType, setTaskType] = useState<string>("both");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();

    // Ouvir mudanças no storage
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.tasks) {
        setTasks(changes.tasks.newValue || []);
      }
    });
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const result = await chrome.storage.local.get<{ tasks: Task[] }>("tasks");
      setTasks(result.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    try {
      if (!newTask || (taskType === "reminder" && !reminderTime)) {
        setError("Preencha todos os campos");
        return;
      }

      const reminderDate = new Date(reminderTime).getTime();
      if (taskType === "reminder" && reminderDate < Date.now()) {
        setError("A data do lembrete deve ser futura");
        return;
      }

      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        reminderTime: taskType === "reminder" ? reminderDate : 0,
        completed: false,
      };

      const updatedTasks = [...tasks, task];
      await chrome.storage.local.set({ tasks: updatedTasks });

      if (taskType === "reminder") {
        // Configurar alarme apenas se for um lembrete
        chrome.alarms.create(task.id, {
          when: task.reminderTime,
        });
      }

      setNewTask("");
      setReminderTime("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar tarefa");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      await chrome.storage.local.set({ tasks: updatedTasks });
      await chrome.alarms.clear(taskId);
      await chrome.notifications.clear(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar tarefa");
    }
  };

  if (loading) {
    return (
      <Card className="w-96 p-4">
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <span className="text-muted-foreground">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96 p-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Tarefas e Lembretes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="task">Nova Tarefa</Label>
            <Input
              id="task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Digite sua tarefa..."
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskType">Tipo de Tarefa</Label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full"
            >
              <option value="both">Ambos</option>
              <option value="task">Tarefa</option>
              <option value="reminder">Lembrete</option>
            </select>
          </div>

          {taskType === "reminder" && (
            <div className="space-y-2">
              <Label htmlFor="reminder">Data e Hora do Lembrete</Label>
              <Input
                id="reminder"
                type="datetime-local"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <Button className="w-full" onClick={addTask}>
            Adicionar Tarefa
          </Button>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(task.reminderTime).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma tarefa adicionada
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default App;
