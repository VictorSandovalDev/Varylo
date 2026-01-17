require('dotenv').config();
const { Pool } = require('pg');

// Use DIRECT_URL for more reliable data seeding if available, otherwise DATABASE_URL
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('Iniciando simulación de conversación (SQL Directo)...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Company
        const resCompany = await client.query('SELECT id, name FROM "Company" LIMIT 1');
        if (resCompany.rows.length === 0) throw new Error('No Company found');
        const company = resCompany.rows[0];
        console.log('Empresa:', company.name);

        // 2. Contact
        const phone = '+14155552398';
        const name = 'Klaus Crawley';
        let contactId;
        const resContact = await client.query('SELECT id FROM "Contact" WHERE "companyId" = $1 AND phone = $2', [company.id, phone]);

        if (resContact.rows.length > 0) {
            contactId = resContact.rows[0].id;
            console.log('Contacto existente:', contactId);
        } else {
            const resInsert = await client.query(`
            INSERT INTO "Contact" (id, "companyId", name, phone, email, "companyName", city, country, "updatedAt", "createdAt")
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id
        `, [company.id, name, phone, 'klaus@crawley.com', 'Crawley Industries', 'Toronto', 'Canada']);
            contactId = resInsert.rows[0].id;
            console.log('Contacto creado:', contactId);
        }

        // 2.5 Channel
        let channelId;
        const resChannel = await client.query('SELECT id FROM "Channel" WHERE "companyId" = $1 LIMIT 1', [company.id]);
        if (resChannel.rows.length > 0) {
            channelId = resChannel.rows[0].id;
            console.log('Canal existente:', channelId);
        } else {
            const resChannelInsert = await client.query(`
            INSERT INTO "Channel" (id, "companyId", type, status, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), $1, 'WHATSAPP', 'CONNECTED', NOW(), NOW())
            RETURNING id
        `, [company.id]);
            channelId = resChannelInsert.rows[0].id;
            console.log('Canal creado:', channelId);
        }

        // 3. Conversation (Include Priority)
        const resConv = await client.query(`
        INSERT INTO "Conversation" (id, "companyId", "channelId", "contactId", status, "lastMessageAt", "updatedAt", "createdAt", priority)
        VALUES (gen_random_uuid(), $1, $2, $3, 'OPEN', NOW(), NOW(), NOW(), 'HIGH')
        RETURNING id
    `, [company.id, channelId, contactId]);
        const conversationId = resConv.rows[0].id;
        console.log('Conversación creada:', conversationId);

        // 4. Tags
        const tags = [
            { name: 'configuración', color: '#10b981' },
            { name: 'prioridad-alta', color: '#ef4444' }
        ];

        for (const t of tags) {
            let tagId;
            const resTag = await client.query('SELECT id FROM "Tag" WHERE "companyId" = $1 AND name = $2', [company.id, t.name]);
            if (resTag.rows.length > 0) {
                tagId = resTag.rows[0].id;
            } else {
                const resTagInsert = await client.query(`
                INSERT INTO "Tag" (id, "companyId", name, color, "showInSidebar", "updatedAt", "createdAt")
                VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
                RETURNING id
            `, [company.id, t.name, t.color]);
                tagId = resTagInsert.rows[0].id;
            }

            // Link Tag to Conversation (Implicit M-N)
            await client.query(`
            INSERT INTO "_ConversationToTag" ("A", "B")
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [conversationId, tagId]);

            // Link Tag to Contact (Implicit M-N)
            await client.query(`
            INSERT INTO "_ContactToTag" ("A", "B")
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [contactId, tagId]);
            console.log('Etiqueta asignada a conversación y contacto:', t.name);
        }

        // 5. Messages
        await client.query(`
        INSERT INTO "Message" (id, "companyId", "conversationId", direction, "from", "to", content, "createdAt", timestamp)
        VALUES (gen_random_uuid(), $1, $2, 'INBOUND', $3, 'System', 'Hola, necesito ayuda para configurar mi nuevo dispositivo.', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
    `, [company.id, conversationId, phone]);

        // Agent
        const resAgent = await client.query(`
        SELECT id, name FROM "User" 
        WHERE "companyId" = $1 AND role IN ('AGENT', 'COMPANY_ADMIN') 
        LIMIT 1
    `, [company.id]);

        if (resAgent.rows.length > 0) {
            const agent = resAgent.rows[0];

            // Assign Agent (M-N join table: _ConversationAgents)
            // A=Conversation, B=User
            await client.query(`
            INSERT INTO "_ConversationAgents" ("A", "B") VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `, [conversationId, agent.id]);
            console.log('Agente asignado:', agent.name);

            // Outbound Message
            await client.query(`
            INSERT INTO "Message" (id, "companyId", "conversationId", direction, "from", "to", content, "senderId", "createdAt", timestamp)
            VALUES (gen_random_uuid(), $1, $2, 'OUTBOUND', $3, $4, '¡Claro! ¿Podrías decirme la marca y el modelo?', $5, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')
        `, [company.id, conversationId, agent.name || 'Agente', phone, agent.id]);
        }

        await client.query('COMMIT');
        console.log('✅ Simulación completada (SQL).');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error en simulación SQL:', e);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

main();
