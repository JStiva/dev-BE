import "dotenv/config";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();
const apiEndpoint = "https://sudreg-data-test.gov.hr/api/javni/";

const getJwtToken = async () => {
  const tokenUrl = "https://sudreg-data-test.gov.hr/api/oauth/token";
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const grantType = "client_credentials";

  if (!clientId || !clientSecret) {
    console.error(
      "Error: CLIENT_ID and CLIENT_SECRET must be set in .env file."
    );
    return;
  }

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({ grant_type: grantType }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
      }
    );

    const { access_token } = response.data;

    if (access_token) {
      return access_token;
    } else {
      console.error("Error: No access token received in the response.");
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchDataPage = async (token, pageNumber, limit = 1000) => {
  try {
    const response = await axios.get(
      `${apiEndpoint}tvrtke?offset=${pageNumber * limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    if (Array.isArray(data)) {
      for (const item of data) {
        try {
          await prisma.tvrtka.upsert({
            where: { mbs: item.mbs },
            update: {
              ime: item.ime,
              naznakaImena: item.naznaka_imena,
            },
            create: {
              ime: item.ime,
              mbs: item.mbs,
              naznakaImena: item.naznaka_imena,
            },
          });
        } catch (error) {
          console.error("Error upsert", error);
        }
      }
    } else {
      console.log("Response:", data);
    }
  } catch (error) {
    console.error("Error getting tvrtke:", error.description);
  }
};

export const fetchDataAndStore = async () => {
  // token valid for 1 hour, no need to save it
  const token = await getJwtToken();
  let totalCount = 0;

  try {
    // same count in /tvrtke headers ["x-total-count"]
    const response = await axios.get(`${apiEndpoint}counts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    totalCount = response.data.find(
      (resp) => resp.table_name === "SRC_TVRTKE"
    )?.count_aktivni;
  } catch (error) {
    console.error("Error: getting count", error.description);
  }
  const totalPages = Math.ceil(totalCount / 1000);

  for (let i = 0; i < totalPages; i++) {
    await fetchDataPage(token, i);
  }
};

export const initializeCronJobs = async () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Scheduled task started...");
      await fetchDataAndStore();
      console.log("Scheduled task finished.");
    } catch (error) {
      console.error(error);
    }
  });
};

// const start = async () => {
//   await fetchDataAndStore();
// };
// start();
