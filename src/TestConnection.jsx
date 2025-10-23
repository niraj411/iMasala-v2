import React, { useEffect, useState } from 'react';

function TestConnection() {
  const [status, setStatus] = useState('Testing...');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function testAPI() {
      try {
        const response = await fetch(
          `https://tandoorikitchenco.com/wp-json/wc/v3/products?consumer_key=ck_008af43ae701970f3967fb5520937abf49530e2a&consumer_secret=cs_c225cd4adcc19f0df1e245cc08bffea8b1f800bd&per_page=3`
        );
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setStatus('✅ API Connection Successful!');
        } else {
          setStatus('❌ API Error: ' + response.status);
        }
      } catch (error) {
        setStatus('❌ Connection Failed: ' + error.message);
      }
    }

    testAPI();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>🍛 Imasala - Connection Test</h1>
      <div style={{ 
        background: status.includes('✅') ? '#d4edda' : '#f8d7da', 
        padding: '20px', 
        margin: '20px 0',
        borderRadius: '10px'
      }}>
        <h2>Status: {status}</h2>
      </div>
      
      {products.length > 0 && (
        <div>
          <h3>Products from your store:</h3>
          <ul>
            {products.map(product => (
              <li key={product.id}>{product.name} - ${product.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TestConnection;