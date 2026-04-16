import { Metadata } from 'next';
import { groupsApi } from '@/lib/api';
import GroupPurchaseDetailClient from './GroupDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const group = await groupsApi.getGroup(id) as any;

    if (!group) {
      return {
        title: 'Group Not Found | ShareSteak',
        description: 'The requested group buy could not be found.',
      };
    }

    return {
      title: `${group.title} | ShareSteak`,
      description: group.description || `Join the ${group.title} group buy on ShareSteak.`,
      openGraph: {
        title: group.title,
        description: group.description || `Join the ${group.title} group buy on ShareSteak.`,
        images: group.product && group.product.images && group.product.images.length > 0 ? [group.product.images[0]] : [],
      },
    };
  } catch (error) {
    console.error('Error fetching group for metadata:', error);
    return {
      title: 'ShareSteak',
      description: 'Community-driven meat sharing.',
    };
  }
}

export default async function GroupPurchaseDetailPage({ params }: Props) {
  const { id } = await params;

  return <GroupPurchaseDetailClient id={id} />;
}
