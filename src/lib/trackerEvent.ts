import { supabase } from './supabase';

export async function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('events').insert({
    event_name: eventName,
    user_id: user?.id ?? null,
    properties: properties ?? {},
  });

  if (error) {
    console.error('Gagal catat event:', error.message);
  }
}
