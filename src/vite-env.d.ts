/// <reference types="vite/client" />

interface ImportMetaEnv {
	// more env variables...
	VITE_API: string;
	VITE_COMFY: string;

	VITE_FIRE_API_KEY: string;
	VITE_FIRE_AUTH_DOMAIN: string;
	VITE_FIRE_PROJECT_ID: string;
	VITE_FIRE_STORAGE_BUCKET: string;
	VITE_FIRE_MESSAGING_SENDER_ID: string;
	VITE_FIRE_APP_ID: string;
	VITE_FIRE_MEASUREMENT_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
