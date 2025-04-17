import {defineConfig} from 'wxt';
import { resolve } from 'node:path';

// See https://wxt.dev/api/config.html
export default defineConfig({
    extensionApi: 'chrome',
    manifest: {
        name: "Crunchyroll-W2G",
        description: "Easy synchronisation for Crunchyroll videos to watch with your friends.",
        permissions: [
            "storage",
        ]
    },
    runner: {
        chromiumProfile: resolve('.browser-data/chrome-data'),
        keepProfileChanges: true,
    },
    modules: [
        '@wxt-dev/auto-icons',
    ],
});
