// src/modules/servidores/service.js
const dayjs = require('dayjs');
const ServidoresRepository = require('./repository');
const AppError = require('../../utils/AppError');

class ServidoresService {
  constructor(db) {
    this.repo = new ServidoresRepository(db);
    this.db = db;
  }

  async listar(filtros, query) {
    return this.repo.findAll({ filtros, query });
  }

  async buscarPorId(id) {
    const servidor = await this.repo.findById(id);
    if (!servidor) throw new AppError('Servidor não encontrado.', 404);
    return servidor;
  }

  async criar(data, tenantId, usuarioId) {
    const {
      regimeJuridico,
      cargoId,
      tabelaSalarialId,
      nivelSalarialId,
      lotacaoId,
      dataAdmissao,
      dataPosse,
      dataExercicio,
      dataTermino,
      cargaHorariaSemanal,
      turno,
      nivelTitulacao,
      titulacaoComprovada,
      portaria,
      lei,
      observacao,
      emailPessoal,
      emailInstitucional,
      celular,
      ...dadosPessoais
    } = data;

    const cpfLimpo = dadosPessoais.cpf?.replace(/\D/g, '');
    const cpfExiste = await this.repo.findByCpf(cpfLimpo);
    if (cpfExiste) throw new AppError('CPF já cadastrado neste órgão.', 409);

    const matricula = await this.repo.gerarMatricula();

    const servidor = await this.repo.create({
      ...dadosPessoais,
      cpf: cpfLimpo,
      matricula,
      tenantId,
    });

    const vinculo = await this.repo.createVinculo({
      servidorId: servidor.id,
      tenantId,
      regimeJuridico,
      cargoId,
      tabelaSalarialId,
      nivelSalarialId,
      lotacaoId,
      dataAdmissao,
      dataPosse: dataPosse || null,
      dataExercicio: dataExercicio || null,
      dataTermino: dataTermino || null,
      cargaHoraria: cargaHorariaSemanal || 40,
      turno: turno || 'INTEGRAL',
      nivelTitulacao: nivelTitulacao || null,
      titulacaoComprovada: titulacaoComprovada || null,
      portaria: portaria || null,
      lei: lei || null,
      observacao: observacao || null,
      situacaoFuncional: 'ATIVO',
      tipoAlteracao: 'ADMISSAO',
      atual: true,
      registradoPor: usuarioId,
    });

    const contatos = [];
    if (emailPessoal) contatos.push({ tipo: 'EMAIL_PESSOAL', valor: emailPessoal, principal: true });
    if (emailInstitucional) contatos.push({ tipo: 'EMAIL_INSTITUCIONAL', valor: emailInstitucional });
    if (celular) contatos.push({ tipo: 'CELULAR', valor: celular });

    if (contatos.length > 0) {
      await this.db.contatoServidor.createMany({
        data: contatos.map((c) => ({ ...c, servidorId: servidor.id })),
      });
    }

    return { ...servidor, vinculoAtual: vinculo };
  }

  async atualizar(id, data, usuarioId) {
    const {
      regimeJuridico,
      cargoId,
      tabelaSalarialId,
      nivelSalarialId,
      lotacaoId,
      dataAdmissao,
      dataPosse,
      dataExercicio,
      dataTermino,
      cargaHorariaSemanal,
      turno,
      nivelTitulacao,
      titulacaoComprovada,
      portaria,
      lei,
      observacao: obsVinculo,
      ...dadosPessoais
    } = data;

    const dadosFuncionais = {
      regimeJuridico,
      cargoId,
      tabelaSalarialId,
      nivelSalarialId,
      lotacaoId,
      dataAdmissao,
      dataPosse,
      dataExercicio,
      dataTermino,
      cargaHoraria: cargaHorariaSemanal,
      turno,
      nivelTitulacao,
      titulacaoComprovada,
      portaria,
      lei,
      observacao: obsVinculo,
    };

    const temDadosPessoais = Object.values(dadosPessoais).some((v) => v !== undefined);
    const temDadosFuncionais = Object.values(dadosFuncionais).some((v) => v !== undefined);

    let servidor;
    if (temDadosPessoais) {
      const payload = Object.fromEntries(Object.entries(dadosPessoais).filter(([, v]) => v !== undefined));
      servidor = await this.repo.update(id, payload);
    } else {
      servidor = await this.buscarPorId(id);
    }

    if (temDadosFuncionais) {
      const vinculoAtual = await this.repo.findVinculoAtual(id);
      if (!vinculoAtual) throw new AppError('Vínculo funcional ativo não encontrado.', 404);

      const payload = Object.fromEntries(Object.entries(dadosFuncionais).filter(([, v]) => v !== undefined));
      await this.repo.updateVinculo(vinculoAtual.id, { ...payload, registradoPor: usuarioId });
    }

    return this.buscarPorId(id);
  }

  async alterarSituacao(id, { situacao, motivo, data, portaria }, usuarioId) {
    const servidor = await this.buscarPorId(id);
    const vinculoAtual = await this.repo.findVinculoAtual(id);
    if (!vinculoAtual) throw new AppError('Vínculo funcional ativo não encontrado.', 404);

    const atualizacaoVinculo = {
      situacaoFuncional: situacao,
      registradoPor: usuarioId,
    };

    if (['EXONERADO', 'APOSENTADO', 'FALECIDO', 'RESCISAO'].includes(situacao)) {
      atualizacaoVinculo.dataEncerramento = data ? new Date(data) : new Date();
      atualizacaoVinculo.motivoEncerramento = motivo || null;
      atualizacaoVinculo.portaria = portaria || null;
      atualizacaoVinculo.atual = false;
      atualizacaoVinculo.tipoAlteracao = _mapSituacaoParaTipoAlteracao(situacao);
    }

    await this.repo.updateVinculo(vinculoAtual.id, atualizacaoVinculo);

    return { message: 'Situação funcional atualizada com sucesso.' };
  }

  async registrarProgressao(servidorId, data, usuarioId) {
    await this.buscarPorId(servidorId);

    const vinculoAtual = await this.repo.findVinculoAtual(servidorId);
    if (!vinculoAtual) throw new AppError('Vínculo funcional ativo não encontrado.', 404);

    const nivelDestino = await this.db.nivelSalarial.findUnique({
      where: { id: data.nivelSalarialDestId },
    });
    if (!nivelDestino) throw new AppError('Nível salarial de destino não encontrado.', 404);

    if (['HORIZONTAL_ANTIGUIDADE', 'HORIZONTAL_MERITO', 'HORIZONTAL_CAPACITACAO'].includes(data.tipo)) {
      const ultimaProgressao = await this.db.progressao.findFirst({
        where: { servidorId, statusAprovacao: 'APROVADO' },
        orderBy: { dataEfetivacao: 'desc' },
      });

      if (ultimaProgressao) {
        const mesesDesde = dayjs().diff(dayjs(ultimaProgressao.dataEfetivacao), 'month');
        const intersticio = vinculoAtual.nivelSalarial?.intersticio || 24;
        if (mesesDesde < intersticio) {
          throw new AppError(
            `Interstício mínimo de ${intersticio} meses não atingido. Faltam ${intersticio - mesesDesde} meses.`,
            400
          );
        }
      }
    }

    const progressao = await this.repo.createProgressao({
      servidorId,
      cargoId: vinculoAtual.cargoId,
      nivelSalarialOriId: vinculoAtual.nivelSalarialId,
      ...data,
    });

    if (['ENQUADRAMENTO_INICIAL', 'REENQUADRAMENTO_LEI'].includes(data.tipo)) {
      await this._efetivarProgressao(servidorId, vinculoAtual, progressao, nivelDestino, usuarioId);
    }

    return progressao;
  }

  async historico(servidorId) {
    await this.buscarPorId(servidorId);
    return this.repo.findHistorico(servidorId);
  }

  async extrato(servidorId) {
    const servidor = await this.buscarPorId(servidorId);
    const progressoes = await this.repo.findProgressoes(servidorId);
    const historico = await this.repo.findHistorico(servidorId);
    return { servidor, progressoes, historico };
  }

  // =============================================================
  // PRIVADOS
  // =============================================================
  async _efetivarProgressao(servidorId, vinculoAtual, progressao, nivelDestino, usuarioId) {
    const atualizacaoVinculo = {
      nivelSalarialId: nivelDestino.id,
      registradoPor: usuarioId,
    };
    if (progressao.nivelNovo) {
      atualizacaoVinculo.nivelTitulacao = progressao.nivelNovo;
    }

    await this.repo.updateVinculo(vinculoAtual.id, atualizacaoVinculo);
    await this.repo.updateProgressao(progressao.id, {
      statusAprovacao: 'APROVADO',
      aprovadoEm: new Date(),
    });
  }
}

function _mapSituacaoParaTipoAlteracao(situacao) {
  const mapa = {
    EXONERADO: 'EXONERACAO',
    APOSENTADO: 'APOSENTADORIA',
    FALECIDO: 'FALECIMENTO',
    RESCISAO: 'RESCISAO',
    AFASTADO: 'AFASTAMENTO',
    CEDIDO: 'CESSAO',
    SUSPENSO: 'SUSPENSAO',
  };
  return mapa[situacao] || 'MUDANCA_REGIME';
}

module.exports = ServidoresService;
