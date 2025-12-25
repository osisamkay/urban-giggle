import SellerGroupDetailClient from './SellerGroupDetailClient';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Manage Group Buy | ShareSteak',
};

export default async function SellerGroupDetailPage({ params }: Props) {
    const { id } = await params;
    return <SellerGroupDetailClient id={id} />;
}
