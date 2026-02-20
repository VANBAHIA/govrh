const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const router = Router();

// TODO: Implementar controller e service completos
// Placeholder — retorna 501 até implementação

router.use(authenticate);

router.get('/', authorize('notificacoes', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo notificacoes em desenvolvimento.' } }));
router.put('/:id/lida', authorize('notificacoes', 'update'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo notificacoes em desenvolvimento.' } }));
router.put('/marcar-todas-lidas', authorize('notificacoes', 'update'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo notificacoes em desenvolvimento.' } }));

module.exports = router;
