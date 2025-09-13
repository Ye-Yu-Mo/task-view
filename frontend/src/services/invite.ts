import api from './api';

export interface Invite {
  id: string;
  code: string;
  creator_id: string;
  executor_id: string | null;
  status: 'pending' | 'used';
  created_at: string;
  used_at: string | null;
}

export interface CreateInviteRequest {
  creator_id: string;
}

export interface UseInviteRequest {
  code: string;
  executor_id: string;
}

export interface UseInviteResponse {
  message: string;
  invite: Invite;
}

export interface InviteListResponse {
  invites: Invite[];
}

// 生成邀请码
export const createInvite = async (data: CreateInviteRequest): Promise<Invite> => {
  return await api.post('/invites', data);
};

// 使用邀请码
export const useInvite = async (data: UseInviteRequest): Promise<UseInviteResponse> => {
  return await api.post('/invites/use', data);
};

// 获取邀请码列表（创建者视角）
export const getInvites = async (creatorId: string): Promise<InviteListResponse> => {
  return await api.get(`/invites/${creatorId}`);
};

// 获取执行者相关的邀请码列表
export const getExecutorInvites = async (executorId: string): Promise<InviteListResponse> => {
  return await api.get(`/invites/executor/${executorId}`);
};
