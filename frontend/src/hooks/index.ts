import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/client';

// Tasks
export function useTasks(filters?: {
  category?: string;
  status?: string;
  mission_id?: string;
}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => api.fetchTasks(filters),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => api.fetchTask(id!),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) =>
      api.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useEstimateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.estimateTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useGenerateSubtasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.generateSubtasks(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}

// Missions
export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: api.fetchMissions,
  });
}

export function useMission(id: string | undefined) {
  return useQuery({
    queryKey: ['mission', id],
    queryFn: () => api.fetchMission(id!),
    enabled: !!id,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Record<string, unknown>) =>
      api.updateMission(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission'] });
    },
  });
}

export function useDeleteMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

// Schedule
export function useSchedule(date?: string) {
  return useQuery({
    queryKey: ['schedule', date],
    queryFn: () => api.fetchSchedule(date),
  });
}

// Config
export function useCategoryConfig() {
  return useQuery({
    queryKey: ['categoryConfig'],
    queryFn: api.fetchCategoryConfig,
  });
}

export function useUpdateCategoryConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateCategoryConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryConfig'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}
