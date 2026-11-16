import { defineConfig } from "vite";

export default defineConfig({
	server: {
		watch: {
			// Chrome debug profile holds locked files on Windows (EBUSY)
			ignored: ["**/.vscode/**", "**/.git/**", "**/dist/**"],
		},
	},
});
