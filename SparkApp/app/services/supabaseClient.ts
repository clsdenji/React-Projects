import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdeieaypbdxysrxavsjx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZWllYXlwYmR4eXNyeGF2c2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTE5MzgsImV4cCI6MjA3MjgyNzkzOH0.AXP0ZLeM8HLi1XXbNpYMcMiU6-t-EhpnyC0ZaCOVgIc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
