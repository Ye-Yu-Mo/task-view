import React from 'react';
import type { Invite } from '../../services/invite';

interface InviteStatusProps {
  invite: Invite;
}

export const InviteStatus: React.FC<InviteStatusProps> = ({ invite }) => {
  const getStatusInfo = () => {
    switch (invite.status) {
      case 'pending':
        return {
          text: '待使用',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      case 'used':
        return {
          text: '已使用',
          color: 'bg-green-100 text-green-800', 
          icon: '✅'
        };
      default:
        return {
          text: '未知',
          color: 'bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="modern-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">邀请码信息</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.icon} {statusInfo.text}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">邀请码:</span>
          <p className="font-mono text-gray-900">{invite.code}</p>
        </div>
        
        <div>
          <span className="text-gray-500">创建时间:</span>
          <p className="text-gray-900">{formatDate(invite.created_at)}</p>
        </div>

        {invite.status === 'used' && (
          <>
            <div>
              <span className="text-gray-500">使用时间:</span>
              <p className="text-gray-900">{formatDate(invite.used_at)}</p>
            </div>
            
            <div>
              <span className="text-gray-500">执行者ID:</span>
              <p className="font-mono text-gray-900 text-xs truncate">
                {invite.executor_id}
              </p>
            </div>
          </>
        )}
      </div>

      {invite.status === 'pending' && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            🎯 此邀请码等待执行者使用，有效期为30天
          </p>
        </div>
      )}

      {invite.status === 'used' && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">
            🎉 此邀请码已被使用，绑定关系已建立
          </p>
        </div>
      )}
    </div>
  );
};
