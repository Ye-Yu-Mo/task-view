import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../../services/task';
import { getInvites, type Invite } from '../../services/invite';
import { getUserById } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const CreateTaskPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inviteId, setInviteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [userCache, setUserCache] = useState<Map<string, string>>(new Map());
  const [loadingInvites, setLoadingInvites] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    if (!user) return;
    
    setLoadingInvites(true);
    try {
      const response = await getInvites(user.id);
      setInvites(response.invites);
      
      // 加载用户名信息
      await loadUserNames(response.invites);
    } catch (err) {
      console.error('加载邀请码列表失败:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  const loadUserNames = async (invites: Invite[]) => {
    const userIds = new Set<string>();
    
    // 收集所有需要获取的用户ID
    invites.forEach(invite => {
      userIds.add(invite.creator_id);
      if (invite.executor_id) {
        userIds.add(invite.executor_id);
      }
    });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('任务标题不能为空');
      return;
    }

    if (!inviteId.trim()) {
      setError('邀请码ID不能为空');
      return;
    }

    if (!user) {
      setError('请先登录');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        creator_id: user.id,
        invite_id: inviteId.trim(),
      });

      // 创建成功后跳转到任务看板
      navigate(`/board/${inviteId.trim()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto modern-card p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">创建新任务</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              任务标题 *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入任务标题"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              任务描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入任务描述（可选）"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="inviteId" className="block text-sm font-medium text-gray-700 mb-1">
              邀请码ID *
            </label>
            <Input
              id="inviteId"
              type="text"
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
              placeholder="请输入邀请码ID"
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
            >
              创建任务
            </Button>
          </div>
        </form>

        {/* 已使用的邀请码列表 */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">已使用的邀请码列表</h3>
          
          {loadingInvites ? (
            <div className="text-center py-4">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : invites.filter(invite => invite.status === 'used').length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">暂无已使用的邀请码</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.filter(invite => invite.status === 'used').map(invite => (
                <div 
                  key={invite.id} 
                  className={`modern-card p-4 cursor-pointer transition-all duration-200 ${
                    inviteId === invite.id ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setInviteId(invite.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">邀请码:</span>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{invite.code}</code>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          已使用
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>ID: <code className="font-mono">{invite.id}</code></div>
                        <div>创建者: {userCache.get(invite.creator_id) || '加载中...'}</div>
                        {invite.executor_id && (
                          <div>执行者: {userCache.get(invite.executor_id) || '加载中...'}</div>
                        )}
                        <div>创建时间: {new Date(invite.created_at).toLocaleString('zh-CN')}</div>
                        <div>使用时间: {new Date(invite.used_at!).toLocaleString('zh-CN')}</div>
                      </div>
                    </div>
                    {inviteId === invite.id && (
                      <div className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">使用说明：</h3>
          <p className="text-sm text-blue-700">
            • 点击上方邀请码卡片可自动选择对应的邀请码ID<br/>
            • 只显示已使用的邀请码（已有执行者绑定）<br/>
            • 任务创建后会关联到选择的邀请码<br/>
            • 执行者可以查看并处理关联的任务
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;
