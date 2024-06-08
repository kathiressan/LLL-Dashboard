import { create } from 'zustand';

const useStore = create((set) => ({
  authToken: null,
  setAuthToken: (token) => set({ authToken: token }),
  removeAuthToken: () => set({ authToken: null }),

  user: null,
  setUser: (user) => set({ user: user }),
  removeUser: () => set({ user: null }),

  tasks: null,
  setTasks: (tasks) => set({ tasks: tasks }),
  removeTasks: () => set({ tasks: [] }),
}));

export default useStore;
