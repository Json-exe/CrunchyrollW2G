import {defineConfig} from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    extensionApi: 'chrome',
    manifest: {
        name: "Crunchyroll-W2G",
        description: "Easy synchronisation for Crunchyroll videos to watch with your friends.",
        permissions: [
            "storage",
        ],
        host_permissions: [
            "http://127.0.0.1:5209*",
            "https://exactly-amusing-cardinal.ngrok-free.app*"
        ]
    },
    runner: {
        chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    },
    modules: [
        '@wxt-dev/auto-icons',
    ],
});
