import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTaskStatus, updateTask, type Task } from '../services/task';
import { getUserById } from '../services/auth';
import { getInviteDetails, type Invite } from '../services/invite';
import { Button } from '../components/ui/Button';
import { TaskCompletionModal } from '../components/ui/TaskCompletionModal';

export const BoardPage: React.FC = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userCache, setUserCache] = useState<Map<string, string>>(new Map()); // 用户ID -> 用户名的缓存
  const [inviteInfo, setInviteInfo] = useState<Invite | null>(null); // 邀请码信息
  const [completionModal, setCompletionModal] = useState<{ isOpen: boolean; task: Task | null }>({ isOpen: false, task: null });
  

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
      // 并行加载任务和邀请码信息
      const [tasksResponse, inviteResponse] = await Promise.all([
        getTasks(inviteId),
        getInviteDetails(inviteId)
      ]);
      
      setTasks(tasksResponse.tasks);
      setInviteInfo(inviteResponse);
      
      // 加载用户名信息，包括邀请码执行者
      await loadUserNames(tasksResponse.tasks, inviteResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserNames = async (tasks: Task[], invite?: Invite | null) => {
    const userIds = new Set<string>();
    
    // 收集所有需要获取的用户ID
    tasks.forEach(task => {
      userIds.add(task.creator_id);
      if (task.executor_id) {
        userIds.add(task.executor_id);
      }
    });
    
    // 如果有邀请码执行者，也加入用户ID列表
    if (invite?.executor_id) {
      userIds.add(invite.executor_id);
    }

    // 使用函数式更新避免依赖问题
    setUserCache(currentCache => {
      const newUserCache = new Map(currentCache);
      
      // 异步获取用户信息
      userIds.forEach(async userId => {
        if (!newUserCache.has(userId)) {
          try {
            const userInfo = await getUserById(userId);
            setUserCache(cache => new Map(cache.set(userId, userInfo.username)));
          } catch (err) {
            console.error(`获取用户信息失败 ${userId}:`, err);
            setUserCache(cache => new Map(cache.set(userId, '未知用户')));
          }
        }
      });
      
      return newUserCache;
    });
  };

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    // 如果状态改为完成，显示完成详情输入框
    if (newStatus === 'done') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setCompletionModal({ isOpen: true, task });
        return;
      }
    }

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

  const handleTaskCompletion = async (taskId: string, completionDetails: string) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, { 
        status: 'done', 
        completion_details: completionDetails 
      });
      // 更新本地状态
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (err) {
      setError('更新任务状态失败');
      throw err;
    }
  };

  const handleAssignExecutor = async (taskId: string, executorId: string) => {
    try {
      await updateTask(taskId, { executor_id: executorId });
      // 更新本地状态
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, executor_id: executorId } : task
        )
      );
    } catch (err) {
      setError('分配执行者失败');
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


  return (
    <div className="min-h-screen">
      <header className="modern-header">
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
          <div className="error-alert mb-6">
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
            <div className="board-column board-column--todo">
              <div className="board-column-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  待处理 ({todoTasks.length})
                </h3>
              </div>
              <div className="space-y-4">
                {todoTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务</p>
                ) : (
                  todoTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onAssignExecutor={handleAssignExecutor}
                      canEdit={user.role === 'executor' || user.id === task.creator_id}
                      userCache={userCache}
                      inviteInfo={inviteInfo}
                      currentUser={user}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 进行中列 */}
            <div className="board-column board-column--progress">
              <div className="board-column-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  进行中 ({inProgressTasks.length})
                </h3>
              </div>
              <div className="space-y-4">
                {inProgressTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务</p>
                ) : (
                  inProgressTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onAssignExecutor={handleAssignExecutor}
                      canEdit={user.role === 'executor' || user.id === task.creator_id}
                      userCache={userCache}
                      inviteInfo={inviteInfo}
                      currentUser={user}
                    />
                  ))
                )}
              </div>
            </div>

            {/* 已完成列 */}
            <div className="board-column board-column--done">
              <div className="board-column-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  已完成 ({doneTasks.length})
                </h3>
              </div>
              <div className="space-y-4">
                {doneTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无任务</p>
                ) : (
                  doneTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onAssignExecutor={handleAssignExecutor}
                      canEdit={user.role === 'executor' || user.id === task.creator_id}
                      userCache={userCache}
                      inviteInfo={inviteInfo}
                      currentUser={user}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 任务完成详情输入模态框 */}
        {completionModal.task && (
          <TaskCompletionModal
            task={completionModal.task}
            isOpen={completionModal.isOpen}
            onClose={() => setCompletionModal({ isOpen: false, task: null })}
            onComplete={handleTaskCompletion}
          />
        )}
      </main>
    </div>
  );
};

// 任务卡片组件
const TaskCard: React.FC<{
  task: Task;
  onStatusChange: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  onAssignExecutor: (taskId: string, executorId: string) => void;
  canEdit: boolean;
  userCache: Map<string, string>;
  inviteInfo: Invite | null;
  currentUser: any;
}> = ({ task, onStatusChange, onAssignExecutor, canEdit, userCache, inviteInfo, currentUser }) => {
  const getStatusOptions = (currentStatus: 'todo' | 'in_progress' | 'done') => {
    const options: { value: 'todo' | 'in_progress' | 'done'; label: string }[] = [];
    if (currentStatus !== 'todo') options.push({ value: 'todo', label: '待处理' });
    if (currentStatus !== 'in_progress') options.push({ value: 'in_progress', label: '进行中' });
    if (currentStatus !== 'done') options.push({ value: 'done', label: '已完成' });
    return options;
  };

  const statusOptions = getStatusOptions(task.status);

  const statusConfig = {
    todo: 'status-badge status-badge--todo',
    in_progress: 'status-badge status-badge--progress',
    done: 'status-badge status-badge--done'
  };

  return (
    <div className={`task-card task-card--${task.status}`}>
      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      {/* 显示完成详情 */}
      {task.status === 'done' && task.completion_details && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
          <h5 className="text-sm font-medium text-green-800 mb-1">完成详情:</h5>
          <p className="text-sm text-green-700">{task.completion_details}</p>
          {task.completed_at && (
            <p className="text-xs text-green-600 mt-1">
              完成时间: {new Date(task.completed_at).toLocaleString('zh-CN')}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <span className={statusConfig[task.status]}>
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
                className="text-xs modern-button modern-button--outline"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              创建者: {userCache.get(task.creator_id) || '加载中...'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            {task.executor_id ? (
              <span className="text-xs text-gray-500">
                执行者: {userCache.get(task.executor_id) || '加载中...'}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">未分配执行者</span>
            )}
            
            {/* 只有创建者可以分配执行者 */}
            {currentUser?.role === 'creator' && currentUser?.id === task.creator_id && inviteInfo?.executor_id && (
              <div className="flex items-center gap-2">
                {!task.executor_id && (
                  <button
                    onClick={() => onAssignExecutor(task.id, inviteInfo.executor_id!)}
                    className="text-xs modern-button modern-button--outline px-2 py-1"
                  >
                    分配给: {userCache.get(inviteInfo.executor_id) || '加载中...'}
                  </button>
                )}
                {task.executor_id && (
                  <button
                    onClick={() => onAssignExecutor(task.id, '')}
                    className="text-xs modern-button modern-button--outline px-2 py-1"
                  >
                    取消分配
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
