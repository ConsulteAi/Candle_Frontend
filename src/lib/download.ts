
/**
 * Utility to handle file downloads
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadPdf = async (url: string, fileName: string = 'documento.pdf') => {
  const fetchWithFallback = async (targetUrl: string, useProxy = false): Promise<Response> => {
    if (useProxy) {
        // Use absolute URL to avoid potential relative path resolution issues
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const proxyUrl = `${baseUrl}/api/pdf-proxy`;
        return fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetUrl })
        });
    }
    return fetch(targetUrl);
  };

  const processResponse = async (response: Response): Promise<void> => {
     const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      // Common patterns for PDF in JSON response
      if (data.url || data.link || data.pdf_url) {
        const nextUrl = data.url || data.link || data.pdf_url;
        // Recursively try to download the next URL, starting with direct fetch again
        await downloadPdf(nextUrl, fileName);
        return;
      }

      if (data.base64 || data.content || data.file) {
        const base64 = data.base64 || data.content || data.file;
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadBlob(blob, fileName);
        return;
      }
      
      throw new Error('Formato de resposta desconhecido');
    } else if (contentType?.includes('text/xml') || contentType?.includes('application/xml')) {
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        
        const pdfBase64 = xmlDoc.getElementsByTagName("PDFBASE64")[0]?.textContent;
        if (pdfBase64) {
            const binaryString = window.atob(pdfBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
            downloadBlob(blob, fileName);
            return;
        }

        const pdfUrl = xmlDoc.getElementsByTagName("URL")[0]?.textContent;
        if (pdfUrl) {
             await downloadPdf(pdfUrl, fileName);
             return;
        }
        
        throw new Error('Não foi possível extrair PDF do XML');
    } else if (contentType?.includes('text/html')) {
        // If we get HTML (like an error page or a login page), throw so we can try proxy or fail
        throw new Error('Retornou HTML em vez de PDF/JSON');
    } else {
      const blob = await response.blob();
      downloadBlob(blob, fileName);
    }
  };

  try {
    // 1. Try direct fetch first
    try {
        // Skip direct fetch for known CORS-restricted domains to avoid console errors
        if (url.includes('api.consultasbigtech.com.br') ||
            url.includes('api.iconsultei.com.br') ||
            url.includes('api.sollosconsultas.com.br')) {
           throw new Error('Force proxy');
        }

        const response = await fetchWithFallback(url, false);
        if (!response.ok) throw new Error('Network response not ok');
        await processResponse(response);
    } catch (directError) {
        if ((directError as Error).message !== 'Force proxy') {
           console.warn('Direct fetch failed, trying proxy...', directError);
        }
        
        // 2. Try via proxy if direct fetch fails (likely CORS)
        const proxyResponse = await fetchWithFallback(url, true);
        if (!proxyResponse.ok) throw new Error(`Proxy response not ok: ${proxyResponse.statusText}`);
        await processResponse(proxyResponse);
    }
  } catch (error) {
    throw error;
  }
};
