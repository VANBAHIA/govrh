const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const { auditLog } = require('../../middlewares/auditLogger');
const ServidorController = require('./servidores.controller');

const router = Router();
const ctrl = new ServidorController();

// Todas as rotas exigem autenticação
router.use(authenticate);

router.get('/',                     authorize('servidores', 'read'),   ctrl.listar);
router.post('/',                    authorize('servidores', 'create'),  auditLog('servidores', 'create'), ctrl.criar);
router.get('/exportar',             authorize('servidores', 'read'),   ctrl.exportar);
router.get('/:id',                  authorize('servidores', 'read'),   ctrl.buscarPorId);
router.put('/:id',                  authorize('servidores', 'update'), auditLog('servidores', 'update'), ctrl.atualizar);
router.delete('/:id',               authorize('servidores', 'delete'), auditLog('servidores', 'delete'), ctrl.desativar);

// Sub-recursos do servidor
router.get('/:id/historico',        authorize('servidores', 'read'),   ctrl.historico);
router.get('/:id/documentos',       authorize('servidores', 'read'),   ctrl.documentos);
router.post('/:id/documentos',      authorize('servidores', 'update'), ctrl.uploadDocumento);
router.get('/:id/progressoes',      authorize('progressao', 'read'),   ctrl.progressoes);
router.get('/:id/extrato',          authorize('servidores', 'read'),   ctrl.extrato);

module.exports = router;
