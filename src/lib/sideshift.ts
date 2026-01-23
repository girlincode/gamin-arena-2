import axios from 'axios';

const SIDESHIFT_API = 'https://sideshift.ai/api/v2';
const AFFILIATE_ID = process.env.SIDESHIFT_AFFILIATE_ID;
const SECRET = process.env.SIDESHIFT_SECRET;

export interface SideShiftQuote {
  id: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount: string;
  settleAmount: string;
  expiresAt: string;
  rate: string;
}

export interface SideShiftShift {
  id: string;
  createdAt: string;
  depositCoin: string;
  settleCoin: string;
  depositAddress: string;
  depositAmount: string;
  settleAmount: string;
  settleAddress: string;
  expiresAt: string;
  status: string;
  rate: string;
}

export async function createQuote(
  depositCoin: string,
  settleCoin: string,
  depositAmount: string,
  settleAddress: string
): Promise<SideShiftQuote> {
  try {
    const response = await axios.post(
      `${SIDESHIFT_API}/quotes`,
      {
        depositCoin,
        depositNetwork: depositCoin === 'matic' ? 'polygon' : undefined,
        settleCoin,
        settleNetwork: settleCoin === 'matic' ? 'polygon' : undefined,
        depositAmount,
        settleAddress,
        affiliateId: AFFILIATE_ID,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-sideshift-secret': SECRET,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('SideShift quote error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to create quote');
  }
}

export async function createFixedShift(
  quoteId: string,
  settleAddress: string,
  refundAddress?: string
): Promise<SideShiftShift> {
  try {
    const response = await axios.post(
      `${SIDESHIFT_API}/shifts/fixed`,
      {
        quoteId,
        settleAddress,
        affiliateId: AFFILIATE_ID,
        refundAddress,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-sideshift-secret': SECRET,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('SideShift shift error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to create shift');
  }
}

export async function getShiftStatus(shiftId: string): Promise<SideShiftShift> {
  try {
    const response = await axios.get(`${SIDESHIFT_API}/shifts/${shiftId}`, {
      headers: {
        'x-sideshift-secret': SECRET,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('SideShift status error:', error.response?.data || error.message);
    throw new Error('Failed to get shift status');
  }
}

export function getSupportedCoins() {
  return [
    { coin: 'btc', name: 'Bitcoin', network: 'bitcoin' },
    { coin: 'eth', name: 'Ethereum', network: 'ethereum' },
    { coin: 'matic', name: 'Polygon', network: 'polygon' },
    { coin: 'usdt', name: 'Tether', network: 'ethereum' },
    { coin: 'usdc', name: 'USD Coin', network: 'ethereum' },
    { coin: 'dai', name: 'Dai', network: 'ethereum' },
    { coin: 'sol', name: 'Solana', network: 'solana' },
    { coin: 'ltc', name: 'Litecoin', network: 'litecoin' },
    { coin: 'doge', name: 'Dogecoin', network: 'dogecoin' },
    { coin: 'trx', name: 'Tron', network: 'tron' },
  ];
}
