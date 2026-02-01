"use server"
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };
    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }
    return serialized;
};

export async function getAccountWithTransactions(accountId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        const account = await db.account.findUnique({
            where: {
                id: accountId,
                userId: user.id,
            },
            include: {
                transactions: {
                    orderBy: { date: "desc" },
                },
                _count: {
                    select: { transactions: true },
                },
            },
        });

        if (!account) return null;

        return {
            ...serializeTransaction(account),
            transactions: account.transactions.map(serializeTransaction),
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function bulkDeleteTransactions(transactionIds) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        // --- FIX: Validation ---
        // Agar yeh string hai (comma separated), toh ise array mein convert karein
        // Agar single string hai, toh array mein daalein
        let idsProcess = [];
        if (Array.isArray(transactionIds)) {
            idsProcess = transactionIds;
        } else if (typeof transactionIds === 'string') {
            // Agar "id1,id2" jaisa string aa raha hai
            idsProcess = transactionIds.includes(',')
                ? transactionIds.split(',')
                : [transactionIds];
        } else {
            throw new Error("Invalid transaction IDs format");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        // Logic using the sanitized 'idsProcess' array
        const transactions = await db.transaction.findMany({
            where: {
                id: { in: idsProcess }, // Use validated array
                userId: user.id,
            },
        });

        // Agar transactions empty aaye, toh return kar do (taaki pata chale match nahi hua)
        if (transactions.length === 0) {
            return { success: false, error: "No matching transactions found to delete" };
        }

        const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            // FIX: Amount ko Number mein convert karein
            const amount = Number(transaction.amount);

            // Logic: Expense delete kar rahe hain toh balance wapas add (+) hoga
            // Income delete kar rahe hain toh balance kam (-) hoga
            const change =
                transaction.type === "EXPENSE"
                    ? amount
                    : -amount;

            // Ab mathematical addition sahi chalega
            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
        }, {});

        await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: {
                    id: { in: idsProcess }, // Use validated array
                    userId: user.id,
                },
            });

            for (const [accountId, balanceChange] of Object.entries(
                accountBalanceChanges
            )) {
                await tx.account.update({
                    where: { id: accountId },
                    data: {
                        balance: {
                            increment: balanceChange,
                        },
                    },
                });
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/account/[id]");

        return { success: true };
    } catch (error) {
        console.error("Bulk Delete Error:", error); // Log actual error
        return { success: false, error: error.message };
    }
}

export async function updateDefaultAccount(accountId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // First, unset any existing default account
        await db.account.updateMany({
            where: {
                userId: user.id,
                isDefault: true,
            },
            data: { isDefault: false },
        });

        // Then set the new default account
        const account = await db.account.update({
            where: {
                id: accountId,
                userId: user.id,
            },
            data: { isDefault: true },
        });

        revalidatePath("/dashboard");
        return { success: true, data: serializeTransaction(account) };
    } catch (error) {
        return { success: false, error: error.message };
    }
}