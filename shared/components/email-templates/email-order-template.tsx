import React from "react";

export const EmailOrderTemplate = ({
  content,
  paymentUrl,
}: {
  content: string;
  paymentUrl?: string;
}) => (
  <div>
    {paymentUrl && (
      <p style={{ marginBottom: "20px", fontSize: "16px" }}>
        Ссылка для оплаты:{" "}
        <a href={paymentUrl} style={{ color: "#2563eb", textDecoration: "underline" }}>
          {paymentUrl}
        </a>
      </p>
    )}
    <div dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);