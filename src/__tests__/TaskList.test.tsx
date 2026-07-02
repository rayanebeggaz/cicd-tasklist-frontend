import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types/task';

const mockTasks: Task[] = [
	{
		id: 1,
		title: 'Première tâche',
		description: 'Description 1',
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
	{
		id: 2,
		title: 'Deuxième tâche',
		description: null,
		completed: true,
		createdAt: '2026-01-16T10:00:00Z',
		updatedAt: '2026-01-16T10:00:00Z',
	},
];

const noop = {
	onToggle: vi.fn(),
	onDelete: vi.fn(),
	onEdit: vi.fn(),
};

describe('TaskList', () => {
	it('shows loading state', () => {
		render(<TaskList tasks={[]} loading={true} error={null} {...noop} />);

		expect(screen.getByTestId('loading')).toBeInTheDocument();
		expect(screen.getByText('Chargement des tâches...')).toBeInTheDocument();
	});

	it('shows error state', () => {
		render(
			<TaskList tasks={[]} loading={false} error="Réseau indisponible" {...noop} />
		);

		expect(screen.getByTestId('error')).toBeInTheDocument();
		expect(screen.getByText(/Réseau indisponible/)).toBeInTheDocument();
	});

	it('shows empty state when there are no tasks', () => {
		render(<TaskList tasks={[]} loading={false} error={null} {...noop} />);

		expect(screen.getByTestId('empty')).toBeInTheDocument();
		expect(screen.getByText('Aucune tâche')).toBeInTheDocument();
	});

	it('renders a list of tasks', () => {
		render(<TaskList tasks={mockTasks} loading={false} error={null} {...noop} />);

		expect(screen.getByTestId('task-list')).toBeInTheDocument();
		expect(screen.getByText('Première tâche')).toBeInTheDocument();
		expect(screen.getByText('Deuxième tâche')).toBeInTheDocument();
		expect(screen.getByText('2 tâches')).toBeInTheDocument();
	});

	it('shows the completed count', () => {
		render(<TaskList tasks={mockTasks} loading={false} error={null} {...noop} />);

		expect(screen.getByText('1 terminée')).toBeInTheDocument();
	});
});
