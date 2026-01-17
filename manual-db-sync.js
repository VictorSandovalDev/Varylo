require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('Iniciando migración manual de base de datos...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create Priority Enum if not exists
        console.log('Verificando tipo Priority enum...');
        const resEnum = await client.query(`
            SELECT n.nspname as schema, t.typname as type 
            FROM pg_type t 
            JOIN pg_namespace n ON n.oid = t.typnamespace 
            WHERE t.typname = 'Priority'
        `);

        if (resEnum.rows.length === 0) {
            await client.query(`CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH')`);
            console.log('Tipo Priority creado.');
        } else {
            console.log('Tipo Priority ya existe.');
        }

        // 2. Add priority column to Conversation
        console.log('Verificando columna priority en Conversation...');
        const resColPriority = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Conversation' AND column_name = 'priority'
        `);

        if (resColPriority.rows.length === 0) {
            await client.query(`ALTER TABLE "Conversation" ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'MEDIUM'`);
            console.log('Columna priority añadida.');
        } else {
            console.log('Columna priority ya existe.');
        }

        // 3. Drop assignedAgentId from Conversation if exists
        console.log('Verificando columna assignedAgentId en Conversation...');
        const resColAgentId = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Conversation' AND column_name = 'assignedAgentId'
        `);

        if (resColAgentId.rows.length > 0) {
            // Check for foreign key constraint first
            const resFk = await client.query(`
                SELECT constraint_name 
                FROM information_schema.key_column_usage 
                WHERE table_name = 'Conversation' AND column_name = 'assignedAgentId'
            `);

            for (const fk of resFk.rows) {
                await client.query(`ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"`);
            }

            await client.query(`ALTER TABLE "Conversation" DROP COLUMN "assignedAgentId"`);
            console.log('Columna assignedAgentId eliminada.');
        } else {
            console.log('Columna assignedAgentId no existe.');
        }

        // 4. Create join table _ConversationAgents if not exists
        console.log('Verificando tabla _ConversationAgents...');
        const resTableAgents = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = '_ConversationAgents'
        `);

        if (resTableAgents.rows.length === 0) {
            await client.query(`
                CREATE TABLE "_ConversationAgents" (
                    "A" TEXT NOT NULL,
                    "B" TEXT NOT NULL
                )
            `);
            await client.query(`CREATE UNIQUE INDEX "_ConversationAgents_AB_unique" ON "_ConversationAgents"("A", "B")`);
            await client.query(`CREATE INDEX "_ConversationAgents_B_index" ON "_ConversationAgents"("B")`);

            // Add foreign keys
            await client.query(`
                ALTER TABLE "_ConversationAgents" 
                ADD CONSTRAINT "_ConversationAgents_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
            `);
            await client.query(`
                ALTER TABLE "_ConversationAgents" 
                ADD CONSTRAINT "_ConversationAgents_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
            `);

            console.log('Tabla _ConversationAgents creada.');
        } else {
            console.log('Tabla _ConversationAgents ya existe.');
        }

        await client.query('COMMIT');
        console.log('✅ Migración manual completada con éxito.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Error en migración manual:', e);
    } finally {
        client.release();
        pool.end();
    }
}

main();
