// Test script to debug affiliate product loading
import { getAffiliateProductsByIds, loadAffiliateProducts } from './src/lib/affiliates.ts';

async function testAffiliateProducts() {
    console.log('Testing affiliate product loading...');
    
    // Test loading all products
    try {
        const allProducts = await loadAffiliateProducts();
        console.log('Total products loaded:', allProducts.length);
        console.log('Product IDs:', allProducts.map(p => p.id));
        
        // Test specific product IDs from the article
        const testIds = ['buku-parenting1', 'worksheet1', 'bukubayi1'];
        console.log('\nTesting specific IDs:', testIds);
        
        const foundProducts = await getAffiliateProductsByIds(testIds);
        console.log('Found products:', foundProducts.length);
        console.log('Found product details:', foundProducts.map(p => ({ id: p.id, name: p.name })));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testAffiliateProducts();
