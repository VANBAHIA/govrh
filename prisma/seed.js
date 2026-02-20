// prisma/seed.js
// Seed inicial: cria tenant de demonstração, roles, permissions e super admin

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // =============================================================
  // ROLES DO SISTEMA
  // =============================================================
  const roles = [
    { nome: 'SUPER_ADMIN', descricao: 'Administrador global do sistema', isSystem: true },
    { nome: 'ADMIN_ORGAO', descricao: 'Administrador do órgão (tenant)', isSystem: true },
    { nome: 'GESTOR_RH', descricao: 'Gestor de Recursos Humanos', isSystem: true },
    { nome: 'GESTOR_PONTO', descricao: 'Gestor de Ponto e Frequência', isSystem: true },
    { nome: 'CHEFE_SETOR', descricao: 'Chefe de setor / aprovador de equipe', isSystem: true },
    { nome: 'SERVIDOR', descricao: 'Acesso self-service do servidor', isSystem: true },
    { nome: 'AUDITOR', descricao: 'Acesso somente leitura para auditoria', isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { nome: role.nome },
      update: {},
      create: role,
    });
  }
  console.log(`✅ ${roles.length} roles criadas.`);

  // =============================================================
  // PERMISSIONS
  // =============================================================
  const recursos = ['servidores', 'folha', 'ponto', 'ferias', 'licencas', 'cargos',
                    'concursos', 'aposentadoria', 'disciplinar', 'assinaturas',
                    'transparencia', 'relatorios', 'usuarios', 'tenants'];
  const acoes = ['create', 'read', 'update', 'delete', 'export', 'approve'];

  for (const recurso of recursos) {
    for (const acao of acoes) {
      await prisma.permission.upsert({
        where: { recurso_acao: { recurso, acao } },
        update: {},
        create: { recurso, acao, descricao: `${acao} em ${recurso}` },
      });
    }
  }
  console.log(`✅ ${recursos.length * acoes.length} permissions criadas.`);

  // =============================================================
  // TENANT DE DEMONSTRAÇÃO
  // =============================================================
  const tenant = await prisma.tenant.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      cnpj: '00.000.000/0001-00',
      razaoSocial: 'Prefeitura Municipal de Demonstração',
      nomeFantasia: 'Prefeitura Demo',
      tipoOrgao: 'PREFEITURA',
      esfera: 'MUNICIPAL',
      uf: 'SP',
      municipio: 'Cidade Demo',
      exercicioAtual: new Date().getFullYear(),
    },
  });
  console.log(`✅ Tenant criado: ${tenant.razaoSocial}`);

  // =============================================================
  // SUPER ADMIN (usuário global)
  // =============================================================
  const senhaHash = await bcrypt.hash('Admin@123456', 12);
  const superAdminRole = await prisma.role.findUnique({ where: { nome: 'SUPER_ADMIN' } });

  const superAdmin = await prisma.usuario.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@govrh.gov.br' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Super Administrador',
      email: 'admin@govrh.gov.br',
      senhaHash,
      ativo: true,
      roles: { create: { roleId: superAdminRole.id } },
    },
  });
  console.log(`✅ Super Admin criado: ${superAdmin.email} / Admin@123456`);

  // =============================================================
  // CONFIGURAÇÃO DE FOLHA PADRÃO
  // =============================================================
  await prisma.configuracaoFolha.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      diaFechamentoFolha: 25,
      diaPagamento: 30,
      percentualRpps: 14.00,
      percentualRppsPatronal: 22.00,
      aliquotaFgts: 8.00,
      margemConsignavel: 35.00,
      adiantamentoPerc: 40.00,
      // Tabela IRRF 2024
      tabelaIrrf: [
        { ate: 2259.20, aliquota: 0, deducao: 0 },
        { ate: 2826.65, aliquota: 7.5, deducao: 169.44 },
        { ate: 3751.05, aliquota: 15, deducao: 381.44 },
        { ate: 4664.68, aliquota: 22.5, deducao: 662.77 },
        { ate: null, aliquota: 27.5, deducao: 896.00 },
      ],
      // Tabela INSS 2024
      tabelaInss: [
        { ate: 1412.00, aliquota: 7.5 },
        { ate: 2666.68, aliquota: 9 },
        { ate: 4000.03, aliquota: 12 },
        { ate: 7786.02, aliquota: 14 },
      ],
    },
  });
  console.log('✅ Configuração de folha criada.');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('📧 Login: admin@govrh.gov.br');
  console.log('🔑 Senha: Admin@123456');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
