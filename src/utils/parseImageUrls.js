export default function parseImageUrls(imageUrl) {
  if (!imageUrl) return [];
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string") {
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [imageUrl];
    } catch {
      return imageUrl.split(",").map((url) => url.trim());
    }
  }
  return [];
}
