export const formatarNome = (texto: string): string => {
  const excecoesMinusculas = ['da', 'de', 'do', 'das', 'dos', 'di', 'e', 'a', 'o', 'as', 'os', 'em', 'com', 'para', 'por', 'na', 'no', 'nas', 'nos'];
  
  if (!texto) return texto;
  
  const palavras = texto.toLowerCase().split(' ');
  
  const resultado = palavras.map((palavra, index) => {
    if (index === 0) {
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }
    
    if (excecoesMinusculas.includes(palavra)) {
      return palavra;
    }
    
    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
  });
  
  return resultado.join(' ');
};

export const obterPrimeiroNome = (nomeCompleto: string): string => {
  if (!nomeCompleto) return '';
  return nomeCompleto.split(' ')[0];
};

export const formatarNomeTurma = (nomeTurma: string): string => {
  if (!nomeTurma) return nomeTurma;
  
  const mapeamentoTurmas: Record<string, string> = {
    'BERCARIO2': 'BERÇÁRIO 2',
    'MATERNAL1': 'MATERNAL 1',
    'MATERNAL2': 'MATERNAL 2',
    'PRE1': 'PRÉ 1',
    'PRE2': 'PRÉ 2',
    'TURNOINVERSO': 'TURNO INVERSO'
  };
  
  if (nomeTurma.toUpperCase() in mapeamentoTurmas) {
    return mapeamentoTurmas[nomeTurma.toUpperCase()];
  }
  
  return nomeTurma;
};

const formatUtils = {
  formatarNome,
  obterPrimeiroNome,
  formatarNomeTurma
};

export default formatUtils;