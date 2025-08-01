// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'Your URL'; 
const supabaseKey = 'Your Key'; 
export const supabase = createClient(supabaseUrl, supabaseKey);
