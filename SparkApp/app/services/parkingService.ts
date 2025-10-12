import { supabase } from './supabaseClient';

export async function saveParkingSpot(userId: string, spot: { id: string; name: string; latitude: number; longitude: number }) {
  const { error } = await supabase.from('saved_parking_spots').upsert({
    user_id: userId,
    parking_id: spot.id,
    name: spot.name,
    latitude: spot.latitude,
    longitude: spot.longitude,
    saved_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function addParkingHistory(userId: string, spot: { id: string; name: string; latitude: number; longitude: number }) {
  const { error } = await supabase.from('parking_history').insert([
    {
      user_id: userId,
      parking_id: spot.id,
      name: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude,
      parked_at: new Date().toISOString(),
    },
  ]);
  if (error) throw error;
}
