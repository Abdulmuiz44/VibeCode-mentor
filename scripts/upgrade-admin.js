const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeUser(email) {
    console.log(`Upgrading user: ${email}`);

    const { data: users, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single();

    if (userError || !users) {
        console.error('User not found:', userError);
        return;
    }

    const userId = users.user_id;
    console.log(`Found user ID: ${userId}`);

    const { error: updateError } = await supabase
        .from('users')
        .update({ is_pro: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

    if (updateError) {
        console.error('Failed to upgrade user:', updateError);
    } else {
        console.log('Successfully upgraded user to Pro!');
    }
}

upgradeUser('abdulmuizproject@gmail.com');
