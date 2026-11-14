import type { ToastItem, ToastType } from '@place-view/ui';

class ToastStore {
	items = $state<ToastItem[]>([]);
	private nextId = 1;

	add(message: string, type: ToastType = 'info', durationMs = 4000): number {
		const id = this.nextId++;
		this.items = [...this.items, { id, message, type }];

		if (durationMs > 0) {
			setTimeout(() => {
				this.dismiss(id);
			}, durationMs);
		}

		return id;
	}

	dismiss(id: number): void {
		this.items = this.items.filter((item) => item.id !== id);
	}
}

export const toastStore = new ToastStore();

export function addToast(message: string, type: ToastType = 'info', durationMs = 4000): number {
	return toastStore.add(message, type, durationMs);
}
