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
    'BERCARIO2': 'Berçário 2',
    'MATERNAL1': 'Maternal 1',
    'MATERNAL2': 'Maternal 2',
    'PRE1': 'Pré 1',
    'PRE2': 'Pré 2',
    'TURNOINVERSO': 'Turno Inverso'
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