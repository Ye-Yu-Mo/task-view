import api from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  creator_id: string;
  executor_id?: string;
  invite_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  creator_id: string;
  invite_id: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  executor_id?: string;
}

export interface UpdateTaskStatusRequest {
  status: 'todo' | 'in_progress' | 'done';
}

export interface TaskListResponse {
  tasks: Task[];
}

// 创建任务
export const createTask = async (taskData: CreateTaskRequest): Promise<Task> => {
  return await api.post('/tasks', taskData);
};

// 获取任务列表
export const getTasks = async (inviteId: string): Promise<TaskListResponse> => {
  return await api.get(`/tasks/${inviteId}`);
};

// 更新任务
export const updateTask = async (taskId: string, taskData: UpdateTaskRequest): Promise<Task> => {
  return await api.put(`/task/${taskId}`, taskData);
};

// 更新任务状态
export const updateTaskStatus = async (taskId: string, statusData: UpdateTaskStatusRequest): Promise<Task> => {
  return await api.put(`/task/${taskId}/status`, statusData);
};

// 删除任务
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/task/${taskId}`);
};
