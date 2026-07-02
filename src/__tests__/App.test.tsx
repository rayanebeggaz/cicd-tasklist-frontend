import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');

const mockApi = vi.mocked(taskApi);

const task: Task = {
	id: 1,
	title: 'Tâche existante',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('App', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the header and loads tasks', async () => {
		mockApi.getTasks.mockResolvedValue([task]);

		render(<App />);

		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.getByText('Tâche existante')).toBeInTheDocument()
		);
		// header stats appear once tasks are loaded
		expect(screen.getByText('Total')).toBeInTheDocument();
	});

	it('adds a task through the form', async () => {
		mockApi.getTasks.mockResolvedValue([]);
		mockApi.createTask.mockResolvedValue({ ...task, id: 2, title: 'Nouvelle' });

		render(<App />);
		await waitFor(() => expect(screen.getByTestId('empty')).toBeInTheDocument());

		await userEvent.type(screen.getByLabelText('Titre'), 'Nouvelle');
		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		await waitFor(() =>
			expect(mockApi.createTask).toHaveBeenCalledWith({ title: 'Nouvelle' })
		);
		await waitFor(() =>
			expect(screen.getByText('Nouvelle')).toBeInTheDocument()
		);
	});
});
