const ServidorService = require('./servidores.service');
const { ok, created, noContent, paginate } = require('../../shared/utils/response');
const { parsePagination } = require('../../shared/utils/pagination');

class ServidorController {
  constructor() {
    this.service = new ServidorService();
    Object.getOwnPropertyNames(ServidorController.prototype)
      .filter(m => m !== 'constructor')
      .forEach(m => (this[m] = this[m].bind(this)));
  }

  async listar(req, res, next) {
    try {
      const { skip, take, page, limit } = parsePagination(req.query);
      const filtros = {
        situacao: req.query.situacao,
        regime: req.query.regime,
        lotacaoId: req.query.lotacaoId,
        cargoId: req.query.cargoId,
        search: req.query.q,
      };
      const { servidores, total } = await this.service.listar(req.tenantId, filtros, skip, take);
      paginate(res, servidores, total, page, limit);
    } catch (err) { next(err); }
  }

  async criar(req, res, next) {
    try {
      const servidor = await this.service.criar(req.tenantId, req.body);
      created(res, servidor);
    } catch (err) { next(err); }
  }

  async buscarPorId(req, res, next) {
    try {
      const servidor = await this.service.buscarPorId(req.tenantId, req.params.id);
      ok(res, servidor);
    } catch (err) { next(err); }
  }

  async atualizar(req, res, next) {
    try {
      const servidor = await this.service.atualizar(req.tenantId, req.params.id, req.body);
      ok(res, servidor);
    } catch (err) { next(err); }
  }

  async desativar(req, res, next) {
    try {
      await this.service.desativar(req.tenantId, req.params.id, req.body);
      noContent(res);
    } catch (err) { next(err); }
  }

  async historico(req, res, next) {
    try {
      const historico = await this.service.historico(req.tenantId, req.params.id);
      ok(res, historico);
    } catch (err) { next(err); }
  }

  async documentos(req, res, next) {
    try {
      const docs = await this.service.documentos(req.tenantId, req.params.id);
      ok(res, docs);
    } catch (err) { next(err); }
  }

  async uploadDocumento(req, res, next) {
    try {
      const doc = await this.service.uploadDocumento(req.tenantId, req.params.id, req.body);
      created(res, doc);
    } catch (err) { next(err); }
  }

  async progressoes(req, res, next) {
    try {
      const data = await this.service.progressoes(req.tenantId, req.params.id);
      ok(res, data);
    } catch (err) { next(err); }
  }

  async extrato(req, res, next) {
    try {
      const data = await this.service.extrato(req.tenantId, req.params.id);
      ok(res, data);
    } catch (err) { next(err); }
  }

  async exportar(req, res, next) {
    try {
      const buffer = await this.service.exportarXlsx(req.tenantId, req.query);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=servidores.xlsx');
      res.send(buffer);
    } catch (err) { next(err); }
  }
}

module.exports = ServidorController;
