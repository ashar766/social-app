import { execFileSync } from "node:child_process";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const useIamAuth = process.env.DATABASE_AUTH_MODE === "iam";

const host =
  "database-1.cluster-crkuem8680h9.ap-southeast-2.rds.amazonaws.com";

const adapter = new PrismaPg(
  useIamAuth
    ? {
        host,
        port: 5432,
        database: "postgres",
        user: "social_app",
        password: () =>
          execFileSync(
            "aws",
            [
              "rds",
              "generate-db-auth-token",
              "--hostname", host,
              "--port", "5432",
              "--region", "ap-southeast-2",
              "--username", "social_app",
            ],
            { encoding: "utf8" }
          ).trim(),
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {
        connectionString: process.env.DATABASE_URL,
      }
);

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
