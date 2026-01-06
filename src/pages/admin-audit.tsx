import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
;
import { apiService } from '../services/api';
import { 
  Card, 
  Table, 
  Button, 
  message, 
  Typography, 
  Space, 
  Tag, 
  Statistic, 
  Row, 
  Col,
  DatePicker,
  Select,
  Input,
  Modal,
  Descriptions
} from 'antd';
import { 
  AuditOutlined, 
  EyeOutlined, 
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  tenantId: string;
  tenant: {
    name: string;
  };
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AuditStats {
  totalActions: number;
  actionsByType: { [key: string]: number };
  actionsByTenant: { [key: string]: number };
  actionsByUser: { [key: string]: number };
  recentActivity: AuditLog[];
}

export default function AdminAudit() {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null,
    action: null,
    entity: null,
    tenant: null,
    user: null
  });
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    loadAuditData();
  }, [router]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const [logs, stats] = await Promise.all([
        apiService.getAuditLogs(),
        apiService.getAuditLogStats(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString()),
      ]);
      setAuditLogs(logs as any);
      setAuditStats(stats as any);
    } catch (error) {
      message.error('Erro ao carregar logs de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    // Implementar exportação de logs
    message.info('Funcionalidade de exportação será implementada em breve.');
  };

  const columns = [
    {
      title: 'Data/Hora',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('pt-BR'),
      sorter: (a: AuditLog, b: AuditLog) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Ação',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const colors: { [key: string]: string } = {
          'CREATE': 'green',
          'UPDATE': 'blue',
          'DELETE': 'red',
          'LOGIN': 'purple',
          'LOGOUT': 'orange'
        };
        return <Tag color={colors[action] || 'default'}>{action}</Tag>;
      },
      filters: [
        { text: 'CREATE', value: 'CREATE' },
        { text: 'UPDATE', value: 'UPDATE' },
        { text: 'DELETE', value: 'DELETE' },
        { text: 'LOGIN', value: 'LOGIN' },
        { text: 'LOGOUT', value: 'LOGOUT' },
      ],
      onFilter: (value: any, record: AuditLog) => record.action === value,
    },
    {
      title: 'Entidade',
      dataIndex: 'entity',
      key: 'entity',
      render: (entity: string) => <Tag>{entity}</Tag>,
    },
    {
      title: 'Usuário',
      key: 'user',
      render: (_: any, record: AuditLog) => (
        <div>
          <div className="font-medium">{record.user.name}</div>
          <div className="text-sm text-gray-500">{record.user.email}</div>
        </div>
      ),
    },
    {
      title: 'Petshop',
      dataIndex: ['tenant', 'name'],
      key: 'tenant',
      render: (name: string) => <Text>{name}</Text>,
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip: string) => <Text code>{ip}</Text>,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: AuditLog) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Detalhes
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <Title level={2} className="text-gray-900 mb-2">
            <AuditOutlined className="mr-2" />
            Auditoria do Sistema
          </Title>
          <Text className="text-gray-600">
            Monitore todas as ações realizadas no sistema por todos os usuários.
          </Text>
        </div>

        {/* Estatísticas */}
        {auditStats && (
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm">
                <Statistic 
                  title="Total de Ações" 
                  value={auditStats.totalActions}
                  prefix={<AuditOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm">
                <Statistic 
                  title="Ações Hoje" 
                  value={auditStats.recentActivity.length}
                  prefix={<AuditOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm">
                <Statistic 
                  title="Petshops Ativos" 
                  value={Object.keys(auditStats.actionsByTenant).length}
                  prefix={<AuditOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm">
                <Statistic 
                  title="Usuários Ativos" 
                  value={Object.keys(auditStats.actionsByUser).length}
                  prefix={<AuditOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filtros */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Text strong className="block mb-1">Período</Text>
              <RangePicker />
            </div>
            <div>
              <Text strong className="block mb-1">Ação</Text>
              <Select placeholder="Todas as ações" style={{ width: 150 }}>
                <Option value="CREATE">CREATE</Option>
                <Option value="UPDATE">UPDATE</Option>
                <Option value="DELETE">DELETE</Option>
                <Option value="LOGIN">LOGIN</Option>
                <Option value="LOGOUT">LOGOUT</Option>
              </Select>
            </div>
            <div>
              <Text strong className="block mb-1">Entidade</Text>
              <Select placeholder="Todas as entidades" style={{ width: 150 }}>
                <Option value="User">User</Option>
                <Option value="Customer">Customer</Option>
                <Option value="Pet">Pet</Option>
                <Option value="Appointment">Appointment</Option>
                <Option value="Sale">Sale</Option>
              </Select>
            </div>
            <div>
              <Text strong className="block mb-1">Petshop</Text>
              <Select placeholder="Todos os petshops" style={{ width: 200 }}>
                {/* Opções serão carregadas dinamicamente */}
              </Select>
            </div>
            <div>
              <Text strong className="block mb-1">Usuário</Text>
              <Input placeholder="Nome ou email" style={{ width: 200 }} />
            </div>
            <Button type="primary" icon={<SearchOutlined />}>
              Filtrar
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadAuditData}>
              Atualizar
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Exportar
            </Button>
          </div>
        </Card>

        {/* Tabela de Logs */}
        <Card className="shadow-sm">
          <Table
            dataSource={auditLogs}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} registros`
            }}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        {/* Modal de Detalhes */}
        <Modal
          title="Detalhes da Ação"
          visible={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
          footer={null}
          width={800}
        >
          {selectedLog && (
            <div className="space-y-4">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Ação" span={2}>
                  <Tag color="blue">{selectedLog.action}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Entidade">
                  {selectedLog.entity}
                </Descriptions.Item>
                <Descriptions.Item label="ID da Entidade">
                  {selectedLog.entityId}
                </Descriptions.Item>
                <Descriptions.Item label="Usuário">
                  {selectedLog.user.name} ({selectedLog.user.email})
                </Descriptions.Item>
                <Descriptions.Item label="Petshop">
                  {selectedLog.tenant.name}
                </Descriptions.Item>
                <Descriptions.Item label="Data/Hora">
                  {new Date(selectedLog.createdAt).toLocaleString('pt-BR')}
                </Descriptions.Item>
                <Descriptions.Item label="IP">
                  <Text code>{selectedLog.ipAddress}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="User Agent" span={2}>
                  <Text code className="text-xs">{selectedLog.userAgent}</Text>
                </Descriptions.Item>
              </Descriptions>

              {selectedLog.details && (
                <div>
                  <Title level={5}>Detalhes da Ação</Title>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
