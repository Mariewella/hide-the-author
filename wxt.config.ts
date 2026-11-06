import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
    manifest: {
        name: 'Hide the Author',
        permissions: ['storage'],
        browser_specific_settings: {            // settings for one specific browser
            gecko: {                            // Firefox's engine
                id: '@book-filter.dominika-skulavik',
                data_collection_permissions: {
                    required: ['none'],         // I don't collect user data
                },
            },
        },
    },
});