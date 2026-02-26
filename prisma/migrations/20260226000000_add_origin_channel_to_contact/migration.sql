-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "originChannel" "ChannelType";

-- Backfill: Set originChannel from the first conversation's channel type
UPDATE "Contact" c
SET "originChannel" = ch.type
FROM "Conversation" conv
JOIN "Channel" ch ON conv."channelId" = ch.id
WHERE conv."contactId" = c.id
  AND c."originChannel" IS NULL
  AND conv.id = (
    SELECT conv2.id FROM "Conversation" conv2
    WHERE conv2."contactId" = c.id
    ORDER BY conv2."createdAt" ASC
    LIMIT 1
  );
