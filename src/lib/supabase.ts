import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function uploadAudio(file: File) {
  const { data, error } = await supabase.storage
    .from("audio")
    .upload(`audio-files/${file.name}`, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("audio")
    .getPublicUrl(`audio-files/${file.name}`);

  return publicUrlData.publicUrl
}
