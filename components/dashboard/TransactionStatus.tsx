import { memo } from "react";

interface TransactionStatusProps {
    status: string | null;
}

export const TransactionStatus = memo<TransactionStatusProps>(({ status }) => {
    if (!status) return null;

    const isError = status.toLowerCase().includes("error");
    const isSuccess = status.toLowerCase().includes("confirmed") || status.toLowerCase().includes("successful");

    let bgColor = "bg-blue-100";
    let textColor = "text-blue-800";

    if (isError) {
        bgColor = "bg-red-100";
        textColor = "text-red-800";
    } else if (isSuccess) {
        bgColor = "bg-green-100";
        textColor = "text-green-800";
    }

    return (
        <div className={`mt-4 p-4 ${bgColor} ${textColor} rounded-lg text-center`}>
            {status}
        </div>
    );
});