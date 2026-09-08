const MAX_COVER_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export type ParsedCover =
  | { error: string }
  | { cover_url: string | null; cover_image: Buffer | null; cover_image_type: string | null };

export const parseCoverForm = async (form: FormData): Promise<ParsedCover> => {
  const coverUrl = String(form.get("cover_url") ?? "").trim();
  const file = form.get("cover_file");

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Cover image must be a JPG or PNG." };
    }
    if (file.size > MAX_COVER_BYTES) {
      return { error: "Cover image must be 2 MB or smaller." };
    }
    return {
      cover_url: coverUrl || null,
      cover_image: Buffer.from(await file.arrayBuffer()),
      cover_image_type: file.type
    };
  }

  return { cover_url: coverUrl || null, cover_image: null, cover_image_type: null };
};
