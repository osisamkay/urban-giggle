import PrintClient from './PrintClient';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Print Packing List | ShareSteak',
};

export default async function PrintPackingListPage({ params }: Props) {
    const { id } = await params;
    return <PrintClient id={id} />;
}
