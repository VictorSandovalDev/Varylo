const { defineConfig } = require('@prisma/config');
require('dotenv').config();

module.exports = defineConfig({
    datasource: {
        provider: 'postgresql',
        url: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL,
    },
});
