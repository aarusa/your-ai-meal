import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testProductsExist, getAllProducts, searchProducts } from '@/integrations/supabase/queries';

export function DebugDatabase() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const productsExist = await testProductsExist();
      const allProducts = await getAllProducts();
      const searchResults = await searchProducts('chicken');
      
      setResults({
        productsExist,
        allProducts,
        searchResults,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Database Debug Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Database Connection'}
        </Button>
        
        {results && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Results:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
