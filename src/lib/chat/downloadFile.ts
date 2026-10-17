export const downloadFile = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");

    const blobUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
