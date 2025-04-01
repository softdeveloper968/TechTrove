import React from "react";
import { Link } from "react-router-dom";

type DownloadButtonProps = {
  fileName: string; // Desired name for the downloaded CSV file
  headers: string[]; // Column headers for the CSV file
  title: string;
};

const DownloadButton = (props: DownloadButtonProps) => {
  const handleDownload = async () => {
    // Create a CSV template with headers and an empty row
    const csvContent = `${props.headers.join(",")}\n${props.headers
      .map(() => "")
      .join(",")}`;

    // Convert the CSV content to a Blob
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Create a downloadable link
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${props.fileName}.csv`;

    // Append the link to the document and trigger the click event
    document.body.appendChild(link);
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
  };

  return (
    <Link
      onClick={handleDownload}
      className="ml-1 text-gray-600 decoration-2 font-medium"
      to={""}
    >
      {props.title}
    </Link>
  );
};

export default DownloadButton;
