const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ucdompsgtzapcalmnmjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZG9tcHNndHphcGNhbG1ubWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNjU1NjAsImV4cCI6MjA3MDY0MTU2MH0.95tZx66VvEIkXEt3gDcPY0I302veJLdAVVKW5azLVJA';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;