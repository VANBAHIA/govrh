// =============================================================
// GovHRPub — Seed inicial
// Cria: Super Admin, Tenant de demo, Roles, Permissões e dados base
// Uso: npm run db:seed
// =============================================================

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ── Permissões do sistema ─────────────────────────────────────
const PERMISSOES = [
  // Servidores
  { recurso: 'servidores',    acao: 'read',   descricao: 'Visualizar servidores' },
  { recurso: 'servidores',    acao: 'create', descricao: 'Cadastrar servidores' },
  { recurso: 'servidores',    acao: 'update', descricao: 'Editar servidores' },
  { recurso: 'servidores',    acao: 'delete', descricao: 'Desativar servidores' },
  // Cargos / PCCV
  { recurso: 'cargos',        acao: 'read',   descricao: 'Visualizar cargos e PCCV' },
  { recurso: 'cargos',        acao: 'create', descricao: 'Criar cargos e tabelas' },
  { recurso: 'cargos',        acao: 'update', descricao: 'Editar cargos e tabelas' },
  { recurso: 'cargos',        acao: 'delete', descricao: 'Desativar cargos' },
  // Folha
  { recurso: 'folha',         acao: 'read',   descricao: 'Visualizar folha de pagamento' },
  { recurso: 'folha',         acao: 'create', descricao: 'Processar folha de pagamento' },
  { recurso: 'folha',         acao: 'update', descricao: 'Fechar/reabrir folha' },
  // Ponto
  { recurso: 'ponto',         acao: 'read',   descricao: 'Visualizar registros de ponto' },
  { recurso: 'ponto',         acao: 'create', descricao: 'Lançar registros de ponto' },
  { recurso: 'ponto',         acao: 'update', descricao: 'Abonar e corrigir ponto' },
  // Férias
  { recurso: 'ferias',        acao: 'read',   descricao: 'Visualizar férias' },
  { recurso: 'ferias',        acao: 'create', descricao: 'Agendar férias' },
  { recurso: 'ferias',        acao: 'update', descricao: 'Aprovar/cancelar férias' },
  // Licenças
  { recurso: 'licencas',      acao: 'read',   descricao: 'Visualizar licenças' },
  { recurso: 'licencas',      acao: 'create', descricao: 'Solicitar licenças' },
  { recurso: 'licencas',      acao: 'update', descricao: 'Aprovar/encerrar licenças' },
  // Progressão
  { recurso: 'progressao',    acao: 'read',   descricao: 'Visualizar progressões' },
  { recurso: 'progressao',    acao: 'create', descricao: 'Registrar progressões' },
  { recurso: 'progressao',    acao: 'update', descricao: 'Aprovar/rejeitar progressões' },
  // Concursos
  { recurso: 'concursos',     acao: 'read',   descricao: 'Visualizar concursos e candidatos' },
  { recurso: 'concursos',     acao: 'create', descricao: 'Criar concursos e registrar posse' },
  { recurso: 'concursos',     acao: 'update', descricao: 'Editar concursos e convocar' },
  // Aposentadoria
  { recurso: 'aposentadoria', acao: 'read',   descricao: 'Visualizar aposentadorias' },
  { recurso: 'aposentadoria', acao: 'create', descricao: 'Registrar pedidos de aposentadoria' },
  { recurso: 'aposentadoria', acao: 'update', descricao: 'Conceder/indeferir aposentadoria' },
  // Disciplinar
  { recurso: 'disciplinar',   acao: 'read',   descricao: 'Visualizar processos disciplinares' },
  { recurso: 'disciplinar',   acao: 'create', descricao: 'Instaurar processos disciplinares' },
  { recurso: 'disciplinar',   acao: 'update', descricao: 'Aplicar penalidades' },
  { recurso: 'disciplinar',   acao: 'delete', descricao: 'Arquivar processos' },
  // Assinatura
  { recurso: 'assinatura',    acao: 'read',   descricao: 'Visualizar documentos para assinar' },
  { recurso: 'assinatura',    acao: 'create', descricao: 'Criar documentos para assinatura' },
  { recurso: 'assinatura',    acao: 'update', descricao: 'Assinar/recusar documentos' },
  // Notificações
  { recurso: 'notificacoes',  acao: 'read',   descricao: 'Visualizar notificações' },
];

// ── Perfis de acesso padrão ───────────────────────────────────
// Quais permissões cada role recebe no seed
const PERFIL_PERMISSOES = {
  ADMIN_ORGAO:  'all',  // todas
  GESTOR_RH:    ['servidores', 'cargos', 'folha', 'ponto', 'ferias', 'licencas', 'progressao', 'concursos', 'aposentadoria', 'assinatura', 'notificacoes'],
  GESTOR_PONTO: ['ponto', 'servidores:read'],
  CHEFE_SETOR:  ['servidores:read', 'ferias:read', 'ferias:update', 'licencas:read', 'licencas:update', 'ponto:read', 'notificacoes:read'],
  SERVIDOR:     ['notificacoes:read'],
  AUDITOR:      ['servidores:read', 'cargos:read', 'folha:read', 'ponto:read', 'ferias:read', 'licencas:read', 'progressao:read', 'concursos:read', 'aposentadoria:read', 'disciplinar:read'],
};

async function main() {
  console.log('🌱 Iniciando seed do GovHRPub...\n');

  // ── 1. Permissões globais ─────────────────────────────────

  console.log('📋 Criando permissões do sistema...');
  const permsCreated = [];
  for (const perm of PERMISSOES) {
    const p = await prisma.permission.upsert({
      where: { recurso_acao: { recurso: perm.recurso, acao: perm.acao } },
      create: perm,
      update: {},
    });
    permsCreated.push(p);
  }
  console.log(`   ✅ ${permsCreated.length} permissões criadas/verificadas`);

  // ── 2. Tenant de demonstração ─────────────────────────────

  console.log('\n🏛️  Criando tenant de demonstração...');
  const tenant = await prisma.tenant.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    create: {
      razaoSocial:      'Prefeitura Municipal de Exemplo',
      nomeFantasia:     'PME - Prefeitura Municipal de Exemplo',
      cnpj:             '00.000.000/0001-00',
      tipoOrgao:        'PREFEITURA',
      esfera:           'MUNICIPAL',
      uf:               'SP',
      municipio:        'Exemplo',
      ativo:            true,
      limiteServidores: 9999,
      plano:            'ENTERPRISE',
      exercicioAtual:   new Date().getFullYear(),

    },
    update: {},
  });
  console.log(`   ✅ Tenant: ${tenant.nome} (ID: ${tenant.id})`);

  // ── 3. Roles do tenant ────────────────────────────────────

  console.log('\n👥 Criando roles e atribuindo permissões...');
  const rolesCreated = {};

  for (const [nomeRole, permScope] of Object.entries(PERFIL_PERMISSOES)) {
    const role = await prisma.role.upsert({
      where: { tenantId_nome: { tenantId: tenant.id, nome: nomeRole } },
      create: { tenantId: tenant.id, nome: nomeRole, descricao: `Perfil ${nomeRole}` },
      update: {},
    });
    rolesCreated[nomeRole] = role;

    // Define quais permissões este role recebe
    let permsDoRole = [];
    if (permScope === 'all') {
      permsDoRole = permsCreated;
    } else {
      permsDoRole = permsCreated.filter(p => {
        return permScope.some(s => {
          if (s.includes(':')) {
            const [r, a] = s.split(':');
            return p.recurso === r && p.acao === a;
          }
          return p.recurso === s;
        });
      });
    }

    // Upsert das permissões do role
    for (const perm of permsDoRole) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        create: { roleId: role.id, permissionId: perm.id },
        update: {},
      });
    }

    console.log(`   ✅ Role ${nomeRole}: ${permsDoRole.length} permissões`);
  }

  // ── 4. Super Admin (tenant especial: null) ────────────────

  console.log('\n🔐 Criando Super Admin...');
  const roleSuper = await prisma.role.upsert({
    where: { tenantId_nome: { tenantId: tenant.id, nome: 'SUPER_ADMIN' } },
    create: { tenantId: tenant.id, nome: 'SUPER_ADMIN', descricao: 'Super Administrador do Sistema' },
    update: {},
  });

  const superSenha = await bcrypt.hash('Admin@2026!', 12);
  const superAdmin = await prisma.usuario.upsert({
    where: { tenantId_email: { email: 'admin@govrh.gov.br', tenantId: tenant.id } },
    create: {
      tenantId: tenant.id,
      nome:     'Super Administrador',
      email:    'admin@govrh.gov.br',
      senhaHash: superSenha,
      ativo:    true,
      roles: { create: { roleId: roleSuper.id } },
    },
    update: {},
  });
  console.log(`   ✅ Super Admin: ${superAdmin.email}`);
  console.log(`   🔑 Senha inicial: Admin@2026!  ← TROQUE IMEDIATAMENTE`);

  // ── 5. Admin do Órgão ─────────────────────────────────────

  console.log('\n👤 Criando Admin do Órgão...');
  const adminSenha = await bcrypt.hash('Rh@2026Pme', 12);
  const adminOrgao = await prisma.usuario.upsert({
    where: { tenantId_email: { email: 'rh@exemplo.gov.br', tenantId: tenant.id } },
    create: {
      tenantId: tenant.id,
      nome:     'Administrador RH',
      email:    'rh@exemplo.gov.br',
      senhaHash: adminSenha,
      ativo:    true,
      roles: { create: { roleId: rolesCreated['ADMIN_ORGAO'].id } },
    },
    update: {},
  });
  console.log(`   ✅ Admin Órgão: ${adminOrgao.email}`);
  console.log(`   🔑 Senha inicial: Rh@2026Pme  ← TROQUE IMEDIATAMENTE`);

  // ── 6. Grupo Ocupacional e Cargo de exemplo ───────────────

  console.log('\n🏗️  Criando estrutura organizacional base...');

  const grupoMag = await prisma.grupoOcupacional.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: 'MAG' } },
    create: { tenantId: tenant.id, codigo: 'MAG', nome: 'Magistério', descricao: 'Profissionais do ensino municipal', ativo: true },
    update: {},
  });

  const grupoAdm = await prisma.grupoOcupacional.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: 'ADM' } },
    create: { tenantId: tenant.id, codigo: 'ADM', nome: 'Administrativo', descricao: 'Cargos administrativos em geral', ativo: true },
    update: {},
  });
  console.log(`   ✅ Grupos: Magistério, Administrativo`);

  // Tabela Salarial
  const tabela = await prisma.tabelaSalarial.upsert({
    where: { tenantId_nome: { tenantId: tenant.id, nome: 'PCCV 2024' } },
    create: {
      tenantId: tenant.id,
      nome: 'PCCV 2024',
      descricao: 'Plano de Cargos, Carreiras e Vencimentos 2024',
      vigenciaIni: new Date('2024-01-01'),
      ativa: true,
    },
    update: {},
  });
  console.log(`   ✅ Tabela Salarial: ${tabela.nome}`);

  // Níveis salariais do Magistério (Nível II — Licenciatura, Classes A-E)
  const niveisBase = [
    { nivel: 'II', classe: 'A', vencimentoBase: 4500.00, intersticio: 24 },
    { nivel: 'II', classe: 'B', vencimentoBase: 4815.00, intersticio: 24 },
    { nivel: 'II', classe: 'C', vencimentoBase: 5152.05, intersticio: 24 },
    { nivel: 'II', classe: 'D', vencimentoBase: 5512.69, intersticio: 24 },
    { nivel: 'II', classe: 'E', vencimentoBase: 5898.58, intersticio: 24 },
    { nivel: 'III', classe: 'A', vencimentoBase: 5400.00, intersticio: 24 },
    { nivel: 'III', classe: 'B', vencimentoBase: 5778.00, intersticio: 24 },
    { nivel: 'III', classe: 'C', vencimentoBase: 6182.46, intersticio: 24 },
    { nivel: 'III', classe: 'D', vencimentoBase: 6615.23, intersticio: 24 },
    { nivel: 'III', classe: 'E', vencimentoBase: 7078.30, intersticio: 24 },
    // Nível ADM
    { nivel: 'I', classe: 'A', vencimentoBase: 3000.00, intersticio: 24 },
    { nivel: 'I', classe: 'B', vencimentoBase: 3210.00, intersticio: 24 },
    { nivel: 'I', classe: 'C', vencimentoBase: 3434.70, intersticio: 24 },
  ];

  for (const n of niveisBase) {
    await prisma.nivelSalarial.upsert({
      where: { tabelaSalarialId_nivel_classe: { tabelaSalarialId: tabela.id, nivel: n.nivel, classe: n.classe } },
      create: { tabelaSalarialId: tabela.id, ...n, percentualProxClasse: 7.00, percentualProxNivel: 20.00 },
      update: {},
    });
  }
  console.log(`   ✅ ${niveisBase.length} Níveis Salariais criados`);

  // Cargos
  const cargoProf = await prisma.cargo.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: 'PROF-01' } },
    create: {
      tenantId: tenant.id, grupoOcupacionalId: grupoMag.id,
      codigo: 'PROF-01', nome: 'Professor de Educação Básica I',
      regimeJuridico: 'ESTATUTARIO', cargaHorariaSemanal: 40,
      escolaridadeMinima: 'SUPERIOR_COMPLETO', ativo: true,
      descricao: 'Docente do ensino fundamental anos iniciais',
    },
    update: {},
  });

  const cargoAgAdm = await prisma.cargo.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: 'AGADM-01' } },
    create: {
      tenantId: tenant.id, grupoOcupacionalId: grupoAdm.id,
      codigo: 'AGADM-01', nome: 'Agente Administrativo',
      regimeJuridico: 'ESTATUTARIO', cargaHorariaSemanal: 40,
      escolaridadeMinima: 'MEDIO_COMPLETO', ativo: true,
    },
    update: {},
  });
  console.log(`   ✅ Cargos: ${cargoProf.nome}, ${cargoAgAdm.nome}`);

  // Lotações
  const secretaria = await prisma.lotacao.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: 'SEMED' } },
    create: {
      tenantId: tenant.id, codigo: 'SEMED', sigla: 'SEMED',
      nome: 'Secretaria Municipal de Educação',
      nivel: 1, ativo: true,
    },
    update: {},
  });

  const deptoPessoal = await prisma.lotacao.upsert({
    where: { tenantId_codigo: { tenantId: tenant.id, codigo: 'DP' } },
    create: {
      tenantId: tenant.id, codigo: 'DP', sigla: 'DP',
      nome: 'Departamento de Pessoal',
      lotacaoPaiId: secretaria.id, nivel: 2, ativo: true,
    },
    update: {},
  });
  console.log(`   ✅ Lotações: SEMED → Departamento de Pessoal`);

  // ── 7. Servidor de exemplo ────────────────────────────────

  console.log('\n👩‍🏫 Criando servidor de exemplo...');
  const nivelIIa = await prisma.nivelSalarial.findFirst({
    where: { tabelaSalarialId: tabela.id, nivel: 'II', classe: 'A' },
  });

  const servidorExemplo = await prisma.servidor.upsert({
    where: { tenantId_cpf: { tenantId: tenant.id, cpf: '123.456.789-00' } },
    create: {
      tenantId: tenant.id,
      matricula: '2024000001',
      nome: 'Maria da Silva Santos',
      cpf: '123.456.789-00',
      dataNascimento: new Date('1985-06-15'),
      estadoCivil: 'CASADO',
      sexo: 'FEMININO',
      escolaridade: 'SUPERIOR_COMPLETO',
      nivelTitulacao: 'II',
      emailInstitucional: 'maria.silva@exemplo.gov.br',
      cargoId: cargoProf.id,
      tabelaSalarialId: tabela.id,
      nivelSalarialId: nivelIIa.id,
      lotacaoId: secretaria.id,
      regimeJuridico: 'ESTATUTARIO',
      situacaoFuncional: 'ATIVO',
      dataAdmissao: new Date('2018-03-01'),
      dataPosse: new Date('2018-03-01'),
      cargaHorariaSemanal: 40,
      municipio: 'Exemplo',
      uf: 'SP',
    },
    update: {},
  });
  console.log(`   ✅ Servidor: ${servidorExemplo.nome} (Matrícula: ${servidorExemplo.matricula})`);

  // Vincula usuário admin ao servidor (opcional)
  await prisma.usuario.update({
    where: { id: adminOrgao.id },
    data: { servidorId: servidorExemplo.id },
  });

  // Período aquisitivo de férias para o servidor de exemplo
  await prisma.periodoAquisitivo.upsert({
    where: { servidorId_dataInicio: { servidorId: servidorExemplo.id, dataInicio: new Date('2023-03-01') } },
    create: {
      servidorId: servidorExemplo.id,
      dataInicio: new Date('2023-03-01'),
      dataFim:    new Date('2024-02-29'),
      diasDireito: 30,
      diasGozados: 0,
      diasAbono: 0,
      saldoDias: 30,
      vencido: true,
    },
    update: {},
  });
  console.log(`   ✅ Período aquisitivo de férias criado`);

  // Configura folha de pagamento
  await prisma.configuracaoFolha.upsert({
    where: { tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      percentualRpps: 14.00,
      margemConsignavel: 35.00,
      tabelaIrrf: [
        { ate: 2259.20,  aliquota: 0,     deducao: 0       },
        { ate: 2826.65,  aliquota: 0.075, deducao: 169.44  },
        { ate: 3751.05,  aliquota: 0.15,  deducao: 381.44  },
        { ate: 4664.68,  aliquota: 0.225, deducao: 662.77  },
        { ate: 99999999, aliquota: 0.275, deducao: 896.00  },
      ],
      tabelaInss: [
        { ate: 1412.00,  aliquota: 0.075 },
        { ate: 2666.68,  aliquota: 0.09  },
        { ate: 4000.03,  aliquota: 0.12  },
        { ate: 7786.02,  aliquota: 0.14  },
      ],
    },
    update: {},
  });
  console.log(`   ✅ Configuração de folha criada (RPPS: 14%, Margem: 35%)`);

  // ── Resumo Final ──────────────────────────────────────────

  console.log('\n' + '='.repeat(55));
  console.log('✅ SEED CONCLUÍDO COM SUCESSO!');
  console.log('='.repeat(55));
  console.log('\n📌 Dados para acesso inicial:\n');
  console.log('  CNPJ do tenant (login): 00.000.000/0001-00');
  console.log('\n  Super Admin:');
  console.log('    Email: admin@govrh.gov.br');
  console.log('    Senha: Admin@2026!');
  console.log('\n  Admin do Órgão:');
  console.log('    Email: rh@exemplo.gov.br');
  console.log('    Senha: Rh@2026Pme');
  console.log('\n⚠️  TROQUE AS SENHAS IMEDIATAMENTE APÓS O PRIMEIRO LOGIN!');
  console.log('='.repeat(55));
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
