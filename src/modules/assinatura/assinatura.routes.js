const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const router = Router();

// TODO: Implementar controller e service completos
// Placeholder — retorna 501 até implementação

router.use(authenticate);

router.get('/pendentes', authorize('assinatura', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo assinatura em desenvolvimento.' } }));
router.post('/', authorize('assinatura', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo assinatura em desenvolvimento.' } }));
router.get('/:id', authorize('assinatura', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo assinatura em desenvolvimento.' } }));
router.post('/:id/assinar', authorize('assinatura', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo assinatura em desenvolvimento.' } }));
router.post('/:id/recusar', authorize('assinatura', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo assinatura em desenvolvimento.' } }));

module.exports = router;
