const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const router = Router();

// TODO: Implementar controller e service completos
// Placeholder — retorna 501 até implementação

router.use(authenticate);

router.get('/simulador/:servidorId', authorize('aposentadoria', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo aposentadoria em desenvolvimento.' } }));
router.post('/pedido', authorize('aposentadoria', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo aposentadoria em desenvolvimento.' } }));
router.get('/:id', authorize('aposentadoria', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo aposentadoria em desenvolvimento.' } }));
router.put('/:id/conceder', authorize('aposentadoria', 'update'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo aposentadoria em desenvolvimento.' } }));
router.get('/pensionistas', authorize('aposentadoria', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo aposentadoria em desenvolvimento.' } }));

module.exports = router;
