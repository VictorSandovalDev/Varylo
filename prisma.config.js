const { defineConfig } = require('@prisma/config');
require('dotenv').config();

function addSsl(url) {
    if (!url) return url;
    const sep = url.includes('?') ? '&' : '?';
    return url.includes('sslmode') ? url : `${url}${sep}sslmode=require`;
}

module.exports = defineConfig({
    datasource: {
        provider: 'postgresql',
        url: addSsl(process.env.DATABASE_URL),
        directUrl: addSsl(process.env.DIRECT_URL),
    },
});
