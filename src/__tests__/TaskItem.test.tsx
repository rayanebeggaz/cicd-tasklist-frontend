import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const task: Task = {
	id: 1,
	title: 'Acheter du pain',
	description: 'À la boulangerie',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

function setup(overrides: Partial<Task> = {}) {
	const onToggle = vi.fn();
	const onDelete = vi.fn();
	const onEdit = vi.fn();
	render(
		<TaskItem
			task={{ ...task, ...overrides }}
			onToggle={onToggle}
			onDelete={onDelete}
			onEdit={onEdit}
		/>
	);
	return { onToggle, onDelete, onEdit };
}

describe('TaskItem', () => {
	it('renders the task title and description', () => {
		setup();

		expect(screen.getByText('Acheter du pain')).toBeInTheDocument();
		expect(screen.getByText('À la boulangerie')).toBeInTheDocument();
	});

	it('calls onToggle when the checkbox is clicked', async () => {
		const { onToggle } = setup();

		await userEvent.click(screen.getByRole('checkbox'));

		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('requires a second click to confirm deletion', async () => {
		const { onDelete } = setup();
		const deleteBtn = screen.getByRole('button', { name: 'Supprimer' });

		await userEvent.click(deleteBtn);
		expect(onDelete).not.toHaveBeenCalled(); // first click asks for confirmation

		await userEvent.click(deleteBtn);
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('enters edit mode and saves the new title', async () => {
		const { onEdit } = setup();

		await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		const input = screen.getByLabelText('Modifier le titre');
		await userEvent.clear(input);
		await userEvent.type(input, 'Nouveau titre');
		await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Nouveau titre',
			description: 'À la boulangerie',
		});
	});

	it('cancels edit mode without saving', async () => {
		const { onEdit } = setup();

		await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(onEdit).not.toHaveBeenCalled();
		expect(screen.getByText('Acheter du pain')).toBeInTheDocument();
	});
});
