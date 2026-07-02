import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders the create form by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);

		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
	});

	it('shows a validation error when submitting an empty title', async () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('submits a trimmed title and description', async () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		await userEvent.type(screen.getByLabelText('Titre'), '  Ma tâche  ');
		await userEvent.type(screen.getByLabelText('Description'), '  détail  ');
		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Ma tâche',
			description: 'détail',
		});
	});

	it('resets the fields after a successful create', async () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		const titleInput = screen.getByLabelText('Titre') as HTMLInputElement;

		await userEvent.type(titleInput, 'Temporaire');
		await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

		expect(titleInput.value).toBe('');
	});

	it('renders in edit mode with initial values and a cancel button', async () => {
		const onCancel = vi.fn();
		render(
			<TaskForm
				mode="edit"
				initialValues={{ title: 'Existant', description: 'desc' }}
				onSubmit={vi.fn()}
				onCancel={onCancel}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect((screen.getByLabelText('Titre') as HTMLInputElement).value).toBe(
			'Existant'
		);

		await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(onCancel).toHaveBeenCalled();
	});
});
