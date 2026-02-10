/**
 * Funções utilitárias de formatação
 */

export const formatPhone = (value: string): string => {
  const raw = value.replace(/\D/g, '');
  if (raw.length <= 2) return raw;
  if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
  if (raw.length <= 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
  return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
};

export const formatCPF = (value: string): string => {
  const raw = value.replace(/\D/g, '');
  if (raw.length <= 3) return raw;
  if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
  if (raw.length <= 9) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
  return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
};

export const formatCNPJ = (value: string): string => {
  const raw = value.replace(/\D/g, '');
  if (raw.length <= 2) return raw;
  if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
  if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
  if (raw.length <= 12) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12, 14)}`;
};

export const formatCPFCNPJ = (value: string): string => {
  const raw = value.replace(/\D/g, '');
  // CPF tem 11 dígitos, CNPJ tem 14 dígitos
  if (raw.length <= 11) {
    return formatCPF(value);
  }
  return formatCNPJ(value);
};

export const formatCEP = (value: string): string => {
  const raw = value.replace(/\D/g, '');
  if (raw.length <= 5) return raw;
  return `${raw.slice(0, 5)}-${raw.slice(5, 8)}`;
};




