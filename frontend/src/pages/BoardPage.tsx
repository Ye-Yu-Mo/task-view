import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTaskStatus, type Task } from '../services/task';
import { Button } from '../components/ui/Button';

export const BoardPage: React.FC = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inviteId) {
      loadTasks();
    }
  }, [inviteId]);

  const loadTasks = async () => {
    if (!inviteId) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await getTasks(inviteId);
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载任务失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      await updateTaskStatus(taskId, { status: newStatus });
      // 更新本地状态
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      setError('更新任务状态失败');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">未登录</h1>
          <p className="text-gray-600 mt-2">请先登录账号</p>
        </div>
      </div>
    );
  }

  if (!inviteId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">无效的邀请码</h1>
          <p className="text-gray-600 mt-2">请检查URL是否正确</p>
        </div>
      </div>
    );
  }

  // 按状态分组任务
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const statusConfig = {
    todo: { title: '待处理', color: 'bg-gray-100', textColor: 'text-gray-800' },
    in_progress: { title: '进行中', color: 'bg-blue-100', textColor: 'text-blue-800' },
    done: { title: '已完成', color: 'bg-green-100', textColor: 'text-green-800' }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">任务看板</h1>
              <p className="text-sm text-gray-600 mt-1">邀请码ID: {inviteId}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  返回仪表板
                </Button>
              </Link>
              {user.role === 'creator' && (
                <Link to="/tasks/create">
                  <Button size="sm">
                    创建任务
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 待处理列 */}
            <div className="bg-white rounded-lg shadow">
              <div className={`px-4 py-3 rounded-t-lg ${statusConfig.todo.color}`}>
                <h3 className="text-lg font-semibold text-gray-900">
                  待处理 ({todoTasks.length})
                </h3>
              </div>
              <div className="p-4 space-y-4 min-h-96">
                {todoTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务</p>
                ) : (
                  todoTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      canEdit={user.role === 'executor' || user.id === task.creator_id}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 进行中列 */}
            <div className="bg-white rounded-lg shadow">
              <div className={`px-4 py-3 rounded-t-lg ${statusConfig.in_progress.color}`}>
                <h3 className="text-lg font-semibold text-gray-900">
                  进行中 ({inProgressTasks.length})
                </h3>
              </div>
              <div className="p-4 space-y-4 min-h-96">
                {inProgressTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务</p>
                ) : (
                  inProgressTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      canEdit={user.role === 'executor' || user.id === task.creator_id}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 已完成列 */}
            <div className="bg-white rounded-lg shadow">
              <div className={`px-4 py-3 rounded-t-lg ${statusConfig.done.color}`}>
                <h3 className="text-lg font-semibold text-gray-900">
                  已完成 ({doneTasks.length})
                </h3>
              </div>
              <div className="p-4 space-y-4 min-h-96">
                {doneTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务</p>
                ) : (
                  doneTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      canEdit={user.role === 'executor' || user.id === task.creator_id}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// 任务卡片组件
const TaskCard: React.FC<{
  task: Task;
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  canEdit: boolean;
}> = ({ task, onStatusChange, canEdit }) => {
  const getStatusOptions = (currentStatus: 'todo' | 'in_progress' | 'done') => {
    const options: { value: 'todo' | 'in_progress' | 'done'; label: string }[] = [];
    if (currentStatus !== 'todo') options.push({ value: 'todo', label: '待处理' });
    if (currentStatus !== 'in_progress') options.push({ value: 'in_progress', label: '进行中' });
    if (currentStatus !== 'done') options.push({ value: 'done', label: '已完成' });
    return options;
  };

  const statusOptions = getStatusOptions(task.status);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          task.status === 'todo' 
            ? 'bg-gray-100 text-gray-800' 
            : task.status === 'in_progress'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {task.status === 'todo' ? '待处理' : task.status === 'in_progress' ? '进行中' : '已完成'}
        </span>
        
        <span className="text-xs text-gray-500">
          {new Date(task.created_at).toLocaleDateString('zh-CN')}
        </span>
      </div>

      {canEdit && statusOptions.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">更新状态:</label>
          <div className="flex flex-wrap gap-1">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onStatusChange(task.id, option.value)}
                className="text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">创建者: {task.creator_id.slice(0, 8)}...</span>
          {task.executor_id && (
            <span className="text-xs text-gray-500">执行者: {task.executor_id.slice(0, 8)}...</span>
          )}
        </div>
      </div>
    </div>
  );
};
