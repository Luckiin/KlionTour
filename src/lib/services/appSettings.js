import { createClient } from "@/lib/supabase";
import { DEFAULT_GAS_PRICE_PER_KM } from "@/lib/transportQuote";

const SETTINGS_ROW_ID = "global";

export async function getAppSettings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", SETTINGS_ROW_ID)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    id: SETTINGS_ROW_ID,
    gas_price_per_km: Number(data?.gas_price_per_km) || DEFAULT_GAS_PRICE_PER_KM,
  };
}

export async function upsertAppSettings(updates) {
  const supabase = createClient();
  const payload = {
    id: SETTINGS_ROW_ID,
    ...updates,
  };

  const { data, error } = await supabase
    .from("app_settings")
    .upsert(payload, { onConflict: "id" })
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
