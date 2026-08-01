import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Busca apenas o preço atual da cripto para testar a rota isolada
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=axie-infinity&vs_currencies=brl');
    const data = await response.json();
    const currentPrice = data['axie-infinity']?.brl;

    if (!currentPrice) {
      return NextResponse.json({ error: 'Não foi possível buscar o preço atual' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Rota funcionando perfeitamente!", 
      currentPrice 
    });
    
  } catch (error) {
    console.error('Erro detalhado:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}