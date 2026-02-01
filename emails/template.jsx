import * as React from "react";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

const EmailLayout = ({ children, previewText, title }) => (
    <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>
                <Heading style={styles.title}>{title}</Heading>
                {children}
                <Text style={styles.footer}>
                    Thank you for using Welth. Keep tracking your finances for better
                    financial health!
                </Text>
            </Container>
        </Body>
    </Html>
);

export default function EmailTemplate({
    userName = "",
    type = "monthly-report",
    data = {},
}) {
    if (type === "monthly-report") {
        const { month, stats, insights } = data;
        const totalIncome = stats?.totalIncome ?? 0;
        const totalExpenses = stats?.totalExpenses ?? 0;

        return (
            <EmailLayout
                previewText="Your Monthly Financial Report"
                title="Monthly Financial Report"
            >
                <Text style={styles.text}>Hello {userName},</Text>
                <Text style={styles.text}>
                    Here&rsquo;s your financial summary for {month}:
                </Text>

                <Section style={styles.statsContainer}>
                    <div style={styles.stat}>
                        <Text style={styles.text}>Total Income</Text>
                        <Text style={styles.heading}>${totalIncome}</Text>
                    </div>
                    <div style={styles.stat}>
                        <Text style={styles.text}>Total Expenses</Text>
                        <Text style={styles.heading}>${totalExpenses}</Text>
                    </div>
                    <div style={styles.stat}>
                        <Text style={styles.text}>Net</Text>
                        <Text style={styles.heading}>${totalIncome - totalExpenses}</Text>
                    </div>
                </Section>

                {stats?.byCategory && (
                    <Section style={styles.section}>
                        <Heading style={styles.heading}>Expenses by Category</Heading>
                        {Object.entries(stats.byCategory).map(([category, amount]) => (
                            <div key={category} style={styles.row}>
                                <Text style={styles.text}>{category}</Text>
                                <Text style={styles.text}>${amount}</Text>
                            </div>
                        ))}
                    </Section>
                )}

                {insights && insights.length > 0 && (
                    <Section style={styles.section}>
                        <Heading style={styles.heading}>Welth Insights</Heading>
                        {insights.map((insight, index) => (
                            <Text key={index} style={styles.text}>
                                • {insight}
                            </Text>
                        ))}
                    </Section>
                )}
            </EmailLayout>
        );
    }

    if (type === "budget-alert") {
        const { percentageUsed = 0, budgetAmount = 0, totalExpenses = 0 } = data;
        return (
            <EmailLayout previewText="Budget Alert" title="Budget Alert">
                <Text style={styles.text}>Hello {userName},</Text>
                <Text style={styles.text}>
                    You&rsquo;ve used {percentageUsed}% of your monthly budget.
                </Text>
                <Section style={styles.statsContainer}>
                    <div style={styles.stat}>
                        <Text style={styles.text}>Budget Amount</Text>
                        <Text style={styles.heading}>${budgetAmount}</Text>
                    </div>
                    <div style={styles.stat}>
                        <Text style={styles.text}>Spent So Far</Text>
                        <Text style={styles.heading}>${totalExpenses}</Text>
                    </div>
                    <div style={styles.stat}>
                        <Text style={styles.text}>Remaining</Text>
                        <Text style={styles.heading}>${budgetAmount - totalExpenses}</Text>
                    </div>
                </Section>
            </EmailLayout>
        );
    }

    return null;
}

const styles = {
    body: {
        backgroundColor: "#f6f9fc",
        fontFamily: "-apple-system, sans-serif",
    },
    container: {
        backgroundColor: "#ffffff",
        margin: "0 auto",
        padding: "20px",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    title: {
        color: "#1f2937",
        fontSize: "32px",
        fontWeight: "bold",
        textAlign: "center",
        margin: "0 0 20px",
    },
    heading: {
        color: "#1f2937",
        fontSize: "20px",
        fontWeight: "600",
        margin: "0 0 16px",
    },
    text: {
        color: "#4b5563",
        fontSize: "16px",
        margin: "0 0 16px",
    },
    section: {
        marginTop: "32px",
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "5px",
        border: "1px solid #e5e7eb",
    },
    statsContainer: {
        margin: "32px 0",
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "5px",
    },
    stat: {
        marginBottom: "16px",
        padding: "12px",
        backgroundColor: "#fff",
        borderRadius: "4px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #e5e7eb",
    },
    footer: {
        color: "#6b7280",
        fontSize: "14px",
        textAlign: "center",
        marginTop: "32px",
        paddingTop: "16px",
        borderTop: "1px solid #e5e7eb",
    },
};