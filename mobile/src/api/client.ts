import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Backend API URL - update this to your actual backend URL
// For iOS Simulator: use localhost
// For Android Emulator: use 10.0.2.2
// For Physical Device: use your computer's local IP (e.g., 192.168.1.x)
const getDevHost = () => {
  const debuggerHost: string | undefined =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost;

  if (!debuggerHost) return undefined;
  // debuggerHost can look like: "192.168.1.5:19000" or "192.168.1.5"
  return String(debuggerHost).split(':')[0];
};

const DEV_HOST = getDevHost();

const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api' // Android emulator
    : DEV_HOST
      ? `http://${DEV_HOST}:4000/api` // Physical device on LAN
      : 'http://api.promrkts.com/api/api' // iOS simulator
  : 'https://api.promrkts.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      await SecureStore.deleteItemAsync('auth_token');
      // You might want to trigger a logout action here
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string, phone?: string) =>
    api.post('/auth/register', { email, password, name, phone }),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  
  confirmAccount: (email: string, code: string) =>
    api.post('/auth/confirm', { email, code }),
  
  resendConfirmation: (email: string) =>
    api.post('/auth/resend-confirmation', { email }),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  logout: () => api.post('/auth/revoke'),
};

// Posts/Feed endpoints
export const feedAPI = {
  getPosts: (page = 1, limit = 20) =>
    api.get('/posts', { params: { page, limit } }),
  
  createPost: (content: string, image?: string) =>
    api.post('/posts', { content, image }),
  
  likePost: (postId: string) =>
    api.post(`/posts/${postId}/like`),
  
  unlikePost: (postId: string) =>
    api.delete(`/posts/${postId}/like`),
  
  commentOnPost: (postId: string, content: string) =>
    api.post(`/posts/${postId}/comments`, { content }),
  
  getComments: (postId: string) =>
    api.get(`/posts/${postId}/comments`),
};

// Journal endpoints
export const journalAPI = {
  getEntries: (page = 1, limit = 50) =>
    api.get('/journal', { params: { page, limit } }),
  
  createEntry: (entry: any) =>
    api.post('/journal', entry),
  
  updateEntry: (id: string, entry: any) =>
    api.put(`/journal/${id}`, entry),
  
  deleteEntry: (id: string) =>
    api.delete(`/journal/${id}`),
  
  getStats: () =>
    api.get('/journal/stats'),
};

// Store endpoints
export const storeAPI = {
  getProducts: (category?: string) =>
    api.get('/products', { params: { category } }),
  
  getProduct: (id: string) =>
    api.get(`/products/${id}`),
  
  getPurchases: () =>
    api.get('/purchases'),
  
  createCheckout: (productId: string) =>
    api.post('/checkout', { productId }),
};

// AI Chat endpoints
export const chatAPI = {
  sendMessage: (message: string, conversationId?: string) =>
    api.post('/chat', { message, conversationId }),
  
  getConversations: () =>
    api.get('/chat/conversations'),
  
  getConversation: (id: string) =>
    api.get(`/chat/conversations/${id}`),
};

// Analytics endpoints
export const analyticsAPI = {
  getDashboard: () =>
    api.get('/analytics/dashboard'),
  
  getPortfolio: () =>
    api.get('/analytics/portfolio'),
  
  getAchievements: () =>
    api.get('/analytics/achievements'),
};

// Dashboard endpoints (for modular layouts)
export const dashboardAPI = {
  getWorkspaces: () =>
    api.get('/dashboard/workspaces'),
  
  createWorkspace: (name: string) =>
    api.post('/dashboard/workspaces', { name }),
  
  updateWorkspace: (id: string, data: { name?: string; isDefault?: boolean }) =>
    api.patch(`/dashboard/workspaces/${id}`, data),
  
  deleteWorkspace: (id: string) =>
    api.delete(`/dashboard/workspaces/${id}`),
  
  getWorkspaceLayout: (id: string) =>
    api.get(`/dashboard/workspaces/${id}/layout`),
  
  saveWorkspaceLayout: (id: string, layout: any, presetKey?: string) =>
    api.put(`/dashboard/workspaces/${id}/layout`, { layout, presetKey }),
  
  applyPreset: (presetKey: string, workspaceId: string) =>
    api.post(`/dashboard/presets/${presetKey}/apply`, { workspaceId }),
  
  getEntitlements: () =>
    api.get('/dashboard/entitlements'),
  
  getHeroLayouts: () =>
    api.get('/dashboard/hero-layouts'),
  
  saveHeroLayouts: (layouts: any, activeName?: string) =>
    api.put('/dashboard/hero-layouts', { layouts, activeName }),
};

// Community endpoints
export const communityAPI = {
  getStatus: () =>
    api.get('/community/status'),
  
  unlock: () =>
    api.post('/community/unlock'),
  
  activateVip: () =>
    api.post('/community/vip/activate'),
};

// User endpoints
export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data: any) =>
    api.patch('/user/profile', data),
};

// Progress endpoints
export const progressAPI = {
  getOverview: () =>
    api.get('/progress/overview'),
  
  getCourseProgress: (tierId: string) =>
    api.get(`/progress/course/${tierId}`),
  
  trackResource: (resourceId: string, data: { progress: number; completed?: boolean }) =>
    api.post(`/progress/resource/${resourceId}`, data),
  
  markLessonCompleted: (tierId: string) =>
    api.post(`/progress/lesson/${tierId}`),
  
  getLeaderboard: () =>
    api.get('/progress/leaderboard'),
};

// Badges endpoints
export const badgesAPI = {
  getAll: () =>
    api.get('/badges'),
  
  getMy: () =>
    api.get('/badges/my'),
  
  getProgress: () =>
    api.get('/badges/progress'),
};

// Trading Groups endpoints
export const groupsAPI = {
  getGroups: (symbol?: string) =>
    api.get('/groups', { params: symbol ? { symbol } : {} }),
  
  createGroup: (data: { name: string; symbol: string; description?: string; isPublic?: boolean }) =>
    api.post('/groups', data),
  
  getGroup: (groupId: string) =>
    api.get(`/groups/${groupId}`),
  
  joinGroup: (groupId: string) =>
    api.post(`/groups/${groupId}/join`),
  
  getMyGroups: () =>
    api.get('/groups/my'),
  
  getMessages: (groupId: string, page = 1, limit = 50) =>
    api.get(`/groups/${groupId}/messages`, { params: { page, limit } }),
  
  sendMessage: (groupId: string, content: string, imageUrl?: string) =>
    api.post(`/groups/${groupId}/messages`, { content, imageUrl }),
};

// Social Media endpoints
export const socialAPI = {
  // Posts
  getPosts: (page = 1, limit = 20) =>
    api.get('/social/posts', { params: { page, limit } }),
  
  getFollowingPosts: (page = 1, limit = 20) =>
    api.get('/social/posts/following', { params: { page, limit } }),
  
  createPost: (content: string, imageUrl?: string) =>
    api.post('/social/posts', { content, imageUrl }),
  
  deletePost: (postId: string) =>
    api.delete(`/social/posts/${postId}`),
  
  likePost: (postId: string) =>
    api.post(`/social/posts/${postId}/like`),
  
  getComments: (postId: string) =>
    api.get(`/social/posts/${postId}/comments`),
  
  createComment: (postId: string, content: string) =>
    api.post(`/social/posts/${postId}/comments`, { content }),

  // Voting
  getVotes: (symbol?: string) =>
    api.get('/social/votes', { params: symbol ? { symbol } : {} }),
  
  castVote: (symbol: string, vote: string) =>
    api.post('/social/votes', { symbol, vote }),
  
  getMyVotes: () =>
    api.get('/social/votes/my'),

  // Promrkts Index
  getPromrktsIndex: () =>
    api.get('/social/index'),

  // Profile
  getProfile: (userId: string) =>
    api.get(`/social/profile/${userId}`),
  
  updateProfile: (data: any) =>
    api.patch('/social/profile', data),
  
  followUser: (userId: string) =>
    api.post(`/social/profile/${userId}/follow`),
  
  getFollowers: (userId: string) =>
    api.get(`/social/profile/${userId}/followers`),
  
  getFollowing: (userId: string) =>
    api.get(`/social/profile/${userId}/following`),
  
  searchUsers: (query: string, limit = 20) =>
    api.get('/social/users/search', { params: { q: query, limit } }),
};

// Upload endpoints
export const uploadAPI = {
  uploadImage: async (uri: string, type: 'post' | 'avatar' | 'chart' = 'post') => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('file', {
      uri,
      name: filename,
      type: mimeType,
    } as any);
    formData.append('type', type);
    
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
