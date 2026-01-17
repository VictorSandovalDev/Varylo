require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('Iniciando migración manual para Contactos...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Add new columns to Contact
        const columns = [
            { name: 'email', type: 'TEXT' },
            { name: 'companyName', type: 'TEXT' },
            { name: 'city', type: 'TEXT' },
            { name: 'country', type: 'TEXT' },
            { name: 'countryCode', type: 'TEXT' },
            { name: 'bio', type: 'TEXT' },
            { name: 'imageUrl', type: 'TEXT' }
        ];

        for (const col of columns) {
            console.log(`Verificando columna ${col.name} en Contact...`);
            const resCol = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'Contact' AND column_name = $1
            `, [col.name]);

            if (resCol.rows.length === 0) {
                await client.query(`ALTER TABLE "Contact" ADD COLUMN "${col.name}" ${col.type}`);
                console.log(`Columna ${col.name} añadida.`);
            } else {
                console.log(`Columna ${col.name} ya existe.`);
            }
        }

        // 2. Create join table _ContactToTag if not exists
        console.log('Verificando tabla _ContactToTag...');
        const resTableTags = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = '_ContactToTag'
        `);

        if (resTableTags.rows.length === 0) {
            await client.query(`
                CREATE TABLE "_ContactToTag" (
                    "A" TEXT NOT NULL,
                    "B" TEXT NOT NULL
                )
            `);
            await client.query(`CREATE UNIQUE INDEX "_ContactToTag_AB_unique" ON "_ContactToTag"("A", "B")`);
            await client.query(`CREATE INDEX "_ContactToTag_B_index" ON "_ContactToTag"("B")`);

            // Add foreign keys
            await client.query(`
                ALTER TABLE "_ContactToTag" 
                ADD CONSTRAINT "_ContactToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE
            `);
            await client.query(`
                ALTER TABLE "_ContactToTag" 
                ADD CONSTRAINT "_ContactToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE
            `);

            console.log('Tabla _ContactToTag creada.');
        } else {
            console.log('Tabla _ContactToTag ya existe.');
        }

        await client.query('COMMIT');
        console.log('✅ Migración manual de Contactos completada.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Error en migración manual:', e);
    } finally {
        client.release();
        pool.end();
    }
}

main();
