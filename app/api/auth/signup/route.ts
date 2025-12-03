import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase.server';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('user_id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = nanoid();
        const now = new Date().toISOString();

        const newUser = {
            user_id: userId,
            email,
            name: name || email.split('@')[0],
            password: hashedPassword,
            created_at: now,
            updated_at: now,
            is_pro: false, // Default to free plan
        };

        console.log('Attempting to create user with ID:', userId);

        const { error: insertError, data: insertedUser } = await supabaseAdmin
            .from('users')
            .insert(newUser)
            .select();

        if (insertError) {
            console.error('Supabase insert error details:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
            return NextResponse.json(
                {
                    error: 'Error creating user',
                    details: process.env.NODE_ENV === 'development' ? insertError.message : undefined
                },
                { status: 500 }
            );
        }

        console.log('User created successfully:', userId);

        return NextResponse.json(
            { message: 'User created successfully', userId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
