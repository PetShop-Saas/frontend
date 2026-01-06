import { useState } from 'react';
import { message } from 'antd';
import { FormInstance } from 'antd/es/form';

export function useCep(form: FormInstance) {
  const [loading, setLoading] = useState(false);

  const searchCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        message.error('CEP não encontrado');
        return;
      }

      form.setFieldsValue({
        addressStreet: data.logradouro || '',
        addressNeighborhood: data.bairro || '',
        addressCity: data.localidade || '',
        addressState: data.uf || '',
      });
      message.success('CEP encontrado!');
    } catch (error) {
      message.error('Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  };

  return { loading, searchCep };
}




