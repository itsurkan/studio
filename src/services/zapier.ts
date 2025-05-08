/**
 * Represents a file to be imported.
 */
export interface File {
  /**
   * The name of the file.
   */
  name: string;
  /**
   * The data of the file.
   */
  data: string;
}

/**
 * Asynchronously imports a file from Google Drive.
 *
 * @param file The file to import.
 * @returns A promise that resolves to true if the import was successful.
 */
export async function importFromGoogleDrive(file: File): Promise<boolean> {
  // TODO: Implement this by calling an API.

  return true;
}

/**
 * Asynchronously imports a file from Dropbox.
 *
 * @param file The file to import.
 * @returns A promise that resolves to true if the import was successful.
 */
export async function importFromDropbox(file: File): Promise<boolean> {
  // TODO: Implement this by calling an API.

  return true;
}
