-- CreateTable
CREATE TABLE "car_category" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seat" TEXT NOT NULL,
    "luggage" TEXT NOT NULL,
    "ac" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "categoryIcon" TEXT NOT NULL,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_category_pkey" PRIMARY KEY ("id")
);
