/**
 * M-Pesa Utilities for parsing SMS and calculating charges
 */

export function calculateMpesaCharge(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 100) return 0;
  if (amount <= 500) return 11;
  if (amount <= 1000) return 29;
  if (amount <= 1500) return 29;
  if (amount <= 2500) return 29;
  if (amount <= 3500) return 52;
  if (amount <= 5000) return 52;
  if (amount <= 7500) return 87;
  if (amount <= 10000) return 115;
  if (amount <= 15000) return 167;
  if (amount <= 20000) return 197;
  if (amount <= 35000) return 278;
  if (amount <= 50000) return 278;
  return 278; // Cap for this sample logic
}

export interface MpesaParsedData {
  receipt: string;
  amount: number;
  phone: string;
  name: string;
  date: string;
}

/**
 * Parses a standard M-Pesa SMS
 * Supports various formats:
 * 1. "SJK1234567 Confirmed. Ksh2,500.00 received from JOHN DOE 0712345678 on 25/5/24 at 2:30 PM."
 * 2. "SJK1234567 Confirmed. Ksh5,000.00 received from 254712345678 JOHN DOE on 25/5/24 at 10:45 AM."
 */
export function parseMpesaSMS(sms: string): MpesaParsedData | null {
  try {
    const cleanSMS = sms.trim();
    
    // Pattern 1: Receipt
    const receiptMatch = cleanSMS.match(/^([A-Z0-9]{10})/i);
    if (!receiptMatch) return null;

    // Pattern 2: Amount
    const amountMatch = cleanSMS.match(/Ksh\s?([\d,]+\.?\d*)/i);
    if (!amountMatch) return null;

    // Pattern 3: Phone
    // Matches 07xx, 01xx, +254xx, 254xx
    const phoneMatch = cleanSMS.match(/(?:07|01|\+254|254)\d{8,9}/);
    
    // Pattern 4: Name
    // Usually between "from" and the phone number or date
    let name = "Unknown";
    const nameMatch = cleanSMS.match(/received from\s+(.*?)(?:\s+07|\s+01|\s+\+254|\s+254|\s+on)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    }

    // Pattern 5: Date
    const dateMatch = cleanSMS.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    let dateStr = new Date().toISOString();
    if (dateMatch) {
      const parts = dateMatch[1].split('/');
      // Assume DD/MM/YY or DD/MM/YYYY
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = "20" + year;
      dateStr = `${year}-${month}-${day}T12:00:00.000Z`;
    }

    return {
      receipt: receiptMatch[1].toUpperCase(),
      amount: parseFloat(amountMatch[1].replace(/,/g, '')),
      phone: phoneMatch ? phoneMatch[0] : '',
      name: name,
      date: dateStr
    };
  } catch (e) {
    console.error("Failed to parse Mpesa SMS", e);
    return null;
  }
}