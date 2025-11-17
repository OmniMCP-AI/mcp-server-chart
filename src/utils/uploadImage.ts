/**
 * Upload image to file service and get public URL
 */
import axios from "axios";
import FormData from "form-data";

const UPLOAD_API = process.env.UPLOAD_API || "http://localhost:3000/api/v1/file/upload";

/**
 * Upload base64 image to file service
 * @param base64Image Base64 encoded image (with or without data URI prefix)
 * @param filename Optional filename
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  base64Image: string,
  filename = "chart.png",
): Promise<string> {
  try {
    // Extract base64 data (remove data URI prefix if exists)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Create form data
    const formData = new FormData();
    formData.append("file", buffer, {
      filename,
      contentType: "image/png",
    });

    // Upload to file service
    const response = await axios.post(UPLOAD_API, formData, {
      headers: {
        accept: "application/json",
        ...formData.getHeaders(),
      },
    });

    // Extract URL from response
    if (response.data && response.data.url) {
      return response.data.url;
    }

    throw new Error("Upload failed: No URL in response");
  } catch (error: any) {
    throw new Error(
      `Failed to upload image: ${error.message || "Unknown error"}`,
    );
  }
}
