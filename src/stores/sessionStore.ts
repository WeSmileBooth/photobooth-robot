import { StorageSerializers, useStorage } from "@vueuse/core";

export function useSession() {
	const data = useStorage<{
		id: string;
		prompt: string[];
		jobId: string | null;
	} | null>("session", null, localStorage, {
		serializer: StorageSerializers.object,
	});

	function create() {
		data.value = {
			id: Math.random().toString(36).slice(-6),
			prompt: [],
			jobId: null,
		};
	}

	function destroy() {
		data.value = null;
	}

	return { data, create, destroy };
}
