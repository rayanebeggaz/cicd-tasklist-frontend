import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getTasks,
	getTask,
	createTask,
	updateTask,
	deleteTask,
} from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

function mockFetchOnce(body: unknown, ok = true, status = 200) {
	return vi.fn().mockResolvedValue({
		ok,
		status,
		json: () => Promise.resolve(body),
		text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
	});
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	it('getTasks returns an array of tasks', async () => {
		vi.stubGlobal('fetch', mockFetchOnce([mockTask]));

		const tasks = await getTasks();

		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTask fetches a single task by id', async () => {
		vi.stubGlobal('fetch', mockFetchOnce(mockTask));

		const task = await getTask(1);

		expect(task).toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
	});

	it('createTask POSTs the payload as JSON', async () => {
		const fetchMock = mockFetchOnce(mockTask, true, 201);
		vi.stubGlobal('fetch', fetchMock);

		const task = await createTask({ title: 'Test' });

		expect(task).toEqual(mockTask);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/tasks',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Test' }),
			})
		);
	});

	it('updateTask PUTs the payload as JSON', async () => {
		const updated = { ...mockTask, completed: true };
		const fetchMock = mockFetchOnce(updated);
		vi.stubGlobal('fetch', fetchMock);

		const task = await updateTask(1, { completed: true });

		expect(task).toEqual(updated);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/tasks/1',
			expect.objectContaining({ method: 'PUT' })
		);
	});

	it('deleteTask sends a DELETE request', async () => {
		const fetchMock = mockFetchOnce('', true, 204);
		vi.stubGlobal('fetch', fetchMock);

		await deleteTask(1);

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/tasks/1',
			expect.objectContaining({ method: 'DELETE' })
		);
	});

	it('throws an error when the response is not ok', async () => {
		vi.stubGlobal('fetch', mockFetchOnce('Server error', false, 500));

		await expect(getTasks()).rejects.toThrow('HTTP 500');
	});

	it('deleteTask throws when the response is not ok', async () => {
		vi.stubGlobal('fetch', mockFetchOnce('Not found', false, 404));

		await expect(deleteTask(99)).rejects.toThrow('HTTP 404');
	});
});
