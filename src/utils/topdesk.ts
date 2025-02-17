export interface TopdeskTicketInfo {
  ticketId: string;
  ticketNumber: string;
}

export function extractTopdeskTicketInfo(url: string): TopdeskTicketInfo | null {
  try {
    const urlObj = new URL(url);
    const unidMatch = urlObj.searchParams.get('unid');
    
    if (!unidMatch) {
      return null;
    }

    // Extract ticket number from the link text
    const ticketNumberMatch = url.match(/MIJ\d+\s+\d+/);
    const ticketNumber = ticketNumberMatch ? ticketNumberMatch[0] : '';

    return {
      ticketId: unidMatch,
      ticketNumber: ticketNumber
    };
  } catch (error) {
    console.error('Failed to extract TopDesk ticket info:', error);
    return null;
  }
}