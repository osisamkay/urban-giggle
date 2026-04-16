import { Metadata } from 'next';
import { productsApi } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await productsApi.getProduct(id) as any;

    if (!product) {
      return {
        title: 'Product Not Found | ShareSteak',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: `${product.title} | ShareSteak`,
      description: product.description || `Buy ${product.title} on ShareSteak.`,
      openGraph: {
        title: product.title,
        description: product.description || `Buy ${product.title} on ShareSteak.`,
        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return {
      title: 'ShareSteak',
      description: 'Your premium meat marketplace.',
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  return <ProductDetailClient id={id} />;
}
