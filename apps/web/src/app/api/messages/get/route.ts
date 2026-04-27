export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function GET(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    // 1. Ownership/Participation Verification
    // Verify that the authenticated user is actually part of this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('participants')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conversation.participants.includes(authResult.user.id)) {
      return NextResponse.json({ error: 'Forbidden: You are not a participant in this conversation' }, { status: 403 });
    }

    // 2. Securely Fetch Messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*, sender:users(id, first_name, last_name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    return NextResponse.json(messages);
  } catch (e: any) {
    console.error('Fetch Messages Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
