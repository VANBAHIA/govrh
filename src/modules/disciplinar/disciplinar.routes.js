const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const router = Router();

// TODO: Implementar controller e service completos
// Placeholder — retorna 501 até implementação

router.use(authenticate);

router.get('/', authorize('disciplinar', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo disciplinar em desenvolvimento.' } }));
router.post('/', authorize('disciplinar', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo disciplinar em desenvolvimento.' } }));
router.get('/:id', authorize('disciplinar', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo disciplinar em desenvolvimento.' } }));
router.put('/:id', authorize('disciplinar', 'update'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo disciplinar em desenvolvimento.' } }));
router.post('/:id/documentos', authorize('disciplinar', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo disciplinar em desenvolvimento.' } }));

module.exports = router;
