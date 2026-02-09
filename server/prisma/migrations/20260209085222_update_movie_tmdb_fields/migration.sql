/*
  Warnings:

  - You are about to drop the column `poster_url` on the `movies` table. All the data in the column will be lost.
  - The `status` column on the `movies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[tmdb_id]` on the table `movies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdb_id` to the `movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movies" DROP COLUMN "poster_url",
ADD COLUMN     "backdrop_path" TEXT,
ADD COLUMN     "cast" JSONB,
ADD COLUMN     "genres" JSONB,
ADD COLUMN     "original_title" TEXT,
ADD COLUMN     "poster_path" TEXT,
ADD COLUMN     "tmdb_id" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NOW_SHOWING';

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");
