export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function DELETE(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
    }

    // 1. Execute Leave
    const { error: deleteError } = await supabaseAdmin
      .from('group_participants')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', authResult.user.id);

    if (deleteError) throw deleteError;

    // 2. Update Group Total atomically
    await (supabaseAdmin as any).rpc('update_group_quantities', { p_group_id: groupId });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Leave Group Exception:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
