/**
 * Utility functions for formatting data in credit reports
 */

export function formatCpf(cpf: string): string {
  if (!cpf || cpf.trim() === "") return "";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.trim() === "") return "";
  const cleaned = cnpj.replace(/\D/g, "");
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length > 11) return phone;
  
  if (cleaned.length > 10) {
    // (11) 99999-9999
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (cleaned.length > 5) {
    // (11) 9999-9999 or partial
    return cleaned.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (cleaned.length > 2) {
    return cleaned.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
  } else {
    return cleaned;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString || dateString.trim() === "") return "";

  try {
    // Check if date is in Brazilian format dd/MM/yyyy
    if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Create date in ISO format (yyyy-MM-dd) which JS understands
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        const date = new Date(isoDate);

        // Check if date is valid
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }
    }

    // Fallback: try to parse as ISO date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    // If all fails, return original string
    return dateString;
  } catch {
    return dateString;
  }
}

export function formatCurrency(value: string): string {
  try {
    // Check if value is in Brazilian format (e.g., "8.143,84")
    // Convert to US format for parsing: remove dots, replace comma with dot
    let cleanValue = value;

    if (value.includes(",")) {
      // Brazilian format: "8.143,84" → "8143.84"
      cleanValue = value.replace(/\./g, "").replace(",", ".");
    }

    const numValue = parseFloat(cleanValue);

    if (isNaN(numValue)) {
      return value;
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  } catch {
    return value;
  }
}
