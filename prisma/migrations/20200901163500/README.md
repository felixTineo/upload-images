# Migration `20200901163500`

This migration has been generated by felix tineo at 9/1/2020, 4:35:00 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Property" (
"id" TEXT NOT NULL,
"title" TEXT NOT NULL,
"value" REAL NOT NULL,
"imageId" TEXT NOT NULL,
PRIMARY KEY ("id"),
FOREIGN KEY ("imageId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE
)

INSERT INTO "new_Property" ("id", "title", "value", "imageId") SELECT "id", "title", "value", "imageId" FROM "Property"

PRAGMA foreign_keys=off;
DROP TABLE "Property";;
PRAGMA foreign_keys=on

ALTER TABLE "new_Property" RENAME TO "Property";

PRAGMA foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200901152304..20200901163500
--- datamodel.dml
+++ datamodel.dml
@@ -2,9 +2,9 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "sqlite"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -13,9 +13,9 @@
 model Property{
   id String @id @default(uuid())
   title String
-  value String
+  value Float
   image File @relation(fields: [imageId], references: [id])
   imageId String
 }
```


