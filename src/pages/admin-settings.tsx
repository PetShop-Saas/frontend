import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
;
import { apiService } from '../services/api';
import { 
  Card, 
  Form, 
  Switch, 
  Button, 
  message, 
  Divider, 
  Typography, 
  Space, 
  Checkbox, 
  Row, 
  Col,
  Alert,
  Tag,
  Modal
} from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface AdminSettings {
  sidebarItems: string[];
  showOperationalModules: boolean;
  showAdvancedModules: boolean;
  showAdminModules: boolean;
  customSidebarItems: string[];
}

const allPossibleSidebarItems = [
  // Módulos Operacionais
  { key: '/customers', label: 'Clientes', category: 'operational' },
  { key: '/pets', label: 'Pets', category: 'operational' },
  { key: '/appointments', label: 'Agendamentos', category: 'operational' },
  { key: '/services', label: 'Serviços', category: 'operational' },
  { key: '/products', label: 'Produtos', category: 'operational' },
  { key: '/sales', label: 'Vendas', category: 'operational' },
  { key: '/reports', label: 'Relatórios', category: 'operational' },
  
  // Módulos Avançados
  { key: '/medical-records', label: 'Histórico Médico', category: 'advanced' },
  { key: '/suppliers', label: 'Fornecedores', category: 'advanced' },
  { key: '/purchases', label: 'Compras', category: 'advanced' },
  { key: '/stock-alerts', label: 'Alertas de Estoque', category: 'advanced' },
  { key: '/financial-reports', label: 'Relatórios Financeiros', category: 'advanced' },
  { key: '/communications', label: 'Comunicação', category: 'advanced' },
  
  // Módulos Administrativos
  { key: '/admin-dashboard', label: 'Admin Dashboard', category: 'admin' },
  { key: '/settings', label: 'Configurações de Banners', category: 'admin' },
  { key: '/user-role-management', label: 'Usuários e Permissões', category: 'admin' },
  { key: '/notifications', label: 'Notificações', category: 'admin' },
  { key: '/audit-logs', label: 'Logs de Auditoria', category: 'admin' },
  { key: '/backup', label: 'Backup & Restore', category: 'admin' },
];

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Carregar configurações atuais do admin
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentSidebarItems = JSON.parse(user.userSidebarItems || '[]');
      
      // Categorizar itens atuais
      const operationalItems = allPossibleSidebarItems.filter(item => 
        currentSidebarItems.includes(item.key) && item.category === 'operational'
      );
      const advancedItems = allPossibleSidebarItems.filter(item => 
        currentSidebarItems.includes(item.key) && item.category === 'advanced'
      );
      const adminItems = allPossibleSidebarItems.filter(item => 
        currentSidebarItems.includes(item.key) && item.category === 'admin'
      );

      form.setFieldsValue({
        sidebarItems: currentSidebarItems,
        showOperationalModules: operationalItems.length > 0,
        showAdvancedModules: advancedItems.length > 0,
        showAdminModules: adminItems.length > 0,
        customSidebarItems: currentSidebarItems
      });
    } catch (error) {

      message.error('Erro ao carregar configurações do admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      // Atualizar sidebar items do admin
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...user,
        userSidebarItems: JSON.stringify(values.sidebarItems)
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Disparar evento para atualizar a sidebar
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
      
      message.success('Configurações salvas com sucesso!');
      
      // Recarregar a página para aplicar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {

      message.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: 'Resetar Configurações',
      content: 'Tem certeza que deseja resetar para as configurações padrão do admin?',
      okText: 'Resetar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        const defaultAdminSidebar = [
          '/dashboard', '/admin-dashboard', '/settings', '/user-role-management', 
          '/notifications', '/audit-logs', '/backup'
        ];
        
        form.setFieldsValue({
          sidebarItems: defaultAdminSidebar,
          showOperationalModules: false,
          showAdvancedModules: false,
          showAdminModules: true,
          customSidebarItems: defaultAdminSidebar
        });
      }
    });
  };

  const operationalItems = allPossibleSidebarItems.filter(item => item.category === 'operational');
  const advancedItems = allPossibleSidebarItems.filter(item => item.category === 'advanced');
  const adminItems = allPossibleSidebarItems.filter(item => item.category === 'admin');

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <Title level={2} className="text-gray-900 mb-2">
            <SettingOutlined className="mr-2" />
            Configurações Gerais do Admin
          </Title>
          <Text className="text-gray-600">
            Configure quais módulos aparecerão na sua sidebar administrativa.
          </Text>
        </div>


        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Módulos Operacionais */}
          <Card title="Módulos Operacionais" className="shadow-sm mb-6">
            <Paragraph className="text-gray-600 mb-4">
              Módulos para gestão diária dos petshops (Clientes, Pets, Agendamentos, etc.)
            </Paragraph>
            
            <Form.Item name="showOperationalModules" valuePropName="checked">
              <Switch 
                checkedChildren="Ativado" 
                unCheckedChildren="Desativado"
                onChange={(checked) => {
                  const currentItems = form.getFieldValue('sidebarItems') || [];
                  let newItems = [...currentItems];
                  
                  if (checked) {
                    // Adicionar módulos operacionais
                    operationalItems.forEach(item => {
                      if (!newItems.includes(item.key)) {
                        newItems.push(item.key);
                      }
                    });
                  } else {
                    // Remover módulos operacionais
                    newItems = newItems.filter(item => 
                      !operationalItems.some(op => op.key === item)
                    );
                  }
                  
                  form.setFieldsValue({ sidebarItems: newItems });
                }}
              />
            </Form.Item>

            <Form.Item name="sidebarItems" style={{ marginBottom: 0 }}>
              <Checkbox.Group 
                disabled={!form.getFieldValue('showOperationalModules')}
                className="grid grid-cols-2 gap-2"
              >
                {operationalItems.map(item => (
                  <Checkbox key={item.key} value={item.key}>
                    {item.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Card>

          {/* Módulos Avançados */}
          <Card title="Módulos Avançados" className="shadow-sm mb-6">
            <Paragraph className="text-gray-600 mb-4">
              Módulos especializados (Histórico Médico, Fornecedores, Compras, etc.)
            </Paragraph>
            
            <Form.Item name="showAdvancedModules" valuePropName="checked">
              <Switch 
                checkedChildren="Ativado" 
                unCheckedChildren="Desativado"
                onChange={(checked) => {
                  const currentItems = form.getFieldValue('sidebarItems') || [];
                  let newItems = [...currentItems];
                  
                  if (checked) {
                    // Adicionar módulos avançados
                    advancedItems.forEach(item => {
                      if (!newItems.includes(item.key)) {
                        newItems.push(item.key);
                      }
                    });
                  } else {
                    // Remover módulos avançados
                    newItems = newItems.filter(item => 
                      !advancedItems.some(adv => adv.key === item)
                    );
                  }
                  
                  form.setFieldsValue({ sidebarItems: newItems });
                }}
              />
            </Form.Item>

            <Form.Item name="sidebarItems" style={{ marginBottom: 0 }}>
              <Checkbox.Group 
                disabled={!form.getFieldValue('showAdvancedModules')}
                className="grid grid-cols-2 gap-2"
              >
                {advancedItems.map(item => (
                  <Checkbox key={item.key} value={item.key}>
                    {item.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Card>

          {/* Módulos Administrativos */}
          <Card title="Módulos Administrativos" className="shadow-sm mb-6">
            <Paragraph className="text-gray-600 mb-4">
              Módulos essenciais para administração do sistema (obrigatórios para admin)
            </Paragraph>
            
            <Form.Item name="showAdminModules" valuePropName="checked" initialValue={true}>
              <Switch 
                checkedChildren="Ativado" 
                unCheckedChildren="Desativado"
                disabled
              />
            </Form.Item>

            <Form.Item name="sidebarItems" style={{ marginBottom: 0 }}>
              <Checkbox.Group 
                disabled={true}
                className="grid grid-cols-2 gap-2"
              >
                {adminItems.map(item => (
                  <Checkbox key={item.key} value={item.key} checked>
                    {item.label} <Tag color="green">Obrigatório</Tag>
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Card>

          {/* Resumo */}
          <Card title="Resumo da Configuração" className="shadow-sm mb-6">
            <Form.Item shouldUpdate>
              {() => {
                const selectedItems = form.getFieldValue('sidebarItems') || [];
                const operationalCount = selectedItems.filter((item: string) =>
                  operationalItems.some(op => op.key === item)
                ).length;
                const advancedCount = selectedItems.filter((item: string) =>
                  advancedItems.some(adv => adv.key === item)
                ).length;
                const adminCount = selectedItems.filter((item: string) =>
                  adminItems.some(adm => adm.key === item)
                ).length;

                return (
                  <div className="space-y-2">
                    <Text strong>Total de itens selecionados: {selectedItems.length}</Text>
                    <div className="flex space-x-4 text-sm">
                      <Tag color="blue">Operacionais: {operationalCount}</Tag>
                      <Tag color="orange">Avançados: {advancedCount}</Tag>
                      <Tag color="green">Administrativos: {adminCount}</Tag>
                    </div>
                  </div>
                );
              }}
            </Form.Item>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-between items-center pt-6">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
              danger
            >
              Resetar para Padrão
            </Button>
            
            <Space>
              <Button onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                htmlType="submit"
                loading={saving}
              >
                Salvar Configurações
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}
