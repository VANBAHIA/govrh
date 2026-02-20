const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const router = Router();

// TODO: Implementar controller e service completos
// Placeholder — retorna 501 até implementação

router.use(authenticate);

router.get('/', (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo tenants em desenvolvimento.' } }));
router.post('/', (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo tenants em desenvolvimento.' } }));
router.get('/:id', (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo tenants em desenvolvimento.' } }));
router.put('/:id', (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo tenants em desenvolvimento.' } }));
router.patch('/:id/status', (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo tenants em desenvolvimento.' } }));

module.exports = router;
