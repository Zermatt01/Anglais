/** Saves a text file on the device through the browser's download. */
export function downloadTextFile(fileName: string, text: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked later: some browsers read the URL after click() returns.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}
