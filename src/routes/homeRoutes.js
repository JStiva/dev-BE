import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const pageNumber = parseInt(req.query.page, 10) + 1 || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 100;

  try {
    const entries = await prisma.tvrtka.findMany({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const totalItems = await prisma.tvrtka.count();
    const totalPages = Math.ceil(totalItems / pageSize);

    const apiResponse = {
      data: entries,
      pagination: {
        totalItems,
        pageSize,
        currentPage: pageNumber,
        totalPages,
        // "hasNextPage": true,
        // "nextPage": 2,
        // "hasPreviousPage": false,
        // "previousPage": null
      },
    };
    res.status(200).json(apiResponse);
  } catch (error) {
    console.error("Error: fetching entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

export default router;
