import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type DefaultCategory = {
  name: string;
  color: string;
  icon: string;
  budgetLimit: number | null;
};

const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Food & Dining", color: "#f97316", icon: "utensils", budgetLimit: 800000 },
  { name: "Transport", color: "#3b82f6", icon: "car", budgetLimit: 300000 },
  { name: "Subscriptions", color: "#8b5cf6", icon: "smartphone", budgetLimit: 200000 },
  { name: "EMI", color: "#1e40af", icon: "landmark", budgetLimit: 1500000 },
  { name: "Shopping", color: "#ec4899", icon: "shopping-bag", budgetLimit: 500000 },
  { name: "Bills & Utilities", color: "#eab308", icon: "zap", budgetLimit: 400000 },
  { name: "Health", color: "#ef4444", icon: "heart-pulse", budgetLimit: 200000 },
  { name: "Entertainment", color: "#14b8a6", icon: "clapperboard", budgetLimit: 300000 },
  { name: "Education", color: "#22c55e", icon: "book-open", budgetLimit: 200000 },
  { name: "Rent", color: "#92400e", icon: "home", budgetLimit: 2000000 },
  { name: "Salary / Income", color: "#ca8a04", icon: "wallet", budgetLimit: null },
  { name: "Other", color: "#6b7280", icon: "package", budgetLimit: 500000 }
];

export async function seedDefaultCategoriesForUser(userId: string): Promise<void> {
  await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      prisma.category.upsert({
        where: {
          userId_name: {
            userId,
            name: category.name
          }
        },
        update: {
          color: category.color,
          icon: category.icon,
          budgetLimit: category.budgetLimit,
          isDefault: true
        },
        create: {
          userId,
          name: category.name,
          color: category.color,
          icon: category.icon,
          budgetLimit: category.budgetLimit,
          isDefault: true
        }
      })
    )
  );
}

async function main(): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true }
  });

  await Promise.all(users.map((user: { id: string }) => seedDefaultCategoriesForUser(user.id)));

  // eslint-disable-next-line no-console
  console.log(`Seeded default categories for ${users.length} user(s).`);
}

main()
  .catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error("Failed to seed categories", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
