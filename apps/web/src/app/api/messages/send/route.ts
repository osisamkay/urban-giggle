export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'conversationId and content are required' }, { status: 400 });
    }

    // 1. Verify Participation
    // Ensure the sender is actually in the conversation to prevent injection
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('participants')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conversation.participants.includes(authResult.user.id)) {
      return NextResponse.json({ error: 'Forbidden: You cannot send messages to a conversation you are not part of' }, { status: 403 });
    }

    // 2. Execute Send
    const { data, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: authResult.user.id,
        content,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Update conversation timestamp
    await supabaseAdmin
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Send Message Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
