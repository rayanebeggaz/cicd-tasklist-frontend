import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');

const mockApi = vi.mocked(taskApi);

const taskA: Task = {
	id: 1,
	title: 'A',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('useTasks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads tasks on mount', async () => {
		mockApi.getTasks.mockResolvedValue([taskA]);

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual([taskA]);
		expect(result.current.error).toBeNull();
	});

	it('sets an error when loading fails', async () => {
		mockApi.getTasks.mockRejectedValue(new Error('Boom'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Boom');
	});

	it('adds a task at the top of the list', async () => {
		mockApi.getTasks.mockResolvedValue([]);
		const created = { ...taskA, id: 2, title: 'B' };
		mockApi.createTask.mockResolvedValue(created);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'B' });
		});

		expect(result.current.tasks[0]).toEqual(created);
	});

	it('removes a task', async () => {
		mockApi.getTasks.mockResolvedValue([taskA]);
		mockApi.deleteTask.mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toHaveLength(0);
	});

	it('toggles completion of an existing task', async () => {
		mockApi.getTasks.mockResolvedValue([taskA]);
		mockApi.updateTask.mockResolvedValue({ ...taskA, completed: true });

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(mockApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks[0].completed).toBe(true);
	});
});
