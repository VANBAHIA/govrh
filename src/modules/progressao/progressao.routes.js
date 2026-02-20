const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const router = Router();

// TODO: Implementar controller e service completos
// Placeholder — retorna 501 até implementação

router.use(authenticate);

router.get('/aptos', authorize('progressao', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo progressao em desenvolvimento.' } }));
router.post('/', authorize('progressao', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo progressao em desenvolvimento.' } }));
router.get('/:servidorId', authorize('progressao', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo progressao em desenvolvimento.' } }));
router.put('/:id/aprovar', authorize('progressao', 'update'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo progressao em desenvolvimento.' } }));
router.put('/:id/rejeitar', authorize('progressao', 'update'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo progressao em desenvolvimento.' } }));

module.exports = router;
