import { serve } from "inngest/next";

import {
    checkBudgetAlerts,
    generateMonthlyReports,
    processRecurringTransaction,
    triggerRecurringTransactions,
} from "@/lib/inngest/function";
import { inngest } from "@/lib/inngest/client";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processRecurringTransaction,
        triggerRecurringTransactions,
        generateMonthlyReports,
        checkBudgetAlerts,
    ],
});