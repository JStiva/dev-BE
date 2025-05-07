-- CreateTable
CREATE TABLE "Tvrtka" (
    "id" SERIAL NOT NULL,
    "ime" TEXT NOT NULL,
    "mbs" INTEGER NOT NULL,
    "naznakaImena" TEXT,

    CONSTRAINT "Tvrtka_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tvrtka_mbs_key" ON "Tvrtka"("mbs");
