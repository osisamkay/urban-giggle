import SellerOrderDetailClient from './SellerOrderDetailClient';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Order Details | Seller Dashboard',
};

export default async function SellerOrderDetailPage({ params }: Props) {
    const { id } = await params;
    return <SellerOrderDetailClient id={id} />;
}
