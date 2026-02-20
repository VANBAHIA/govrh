const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/authenticate');
const router = Router();

// TODO: Implementar controller e service completos
// Placeholder — retorna 501 até implementação

router.use(authenticate);

router.get('/', authorize('concursos', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo concurso em desenvolvimento.' } }));
router.post('/', authorize('concursos', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo concurso em desenvolvimento.' } }));
router.get('/:id', authorize('concursos', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo concurso em desenvolvimento.' } }));
router.put('/:id', authorize('concursos', 'update'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo concurso em desenvolvimento.' } }));
router.post('/:id/convocacao', authorize('concursos', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo concurso em desenvolvimento.' } }));
router.post('/:id/posse', authorize('concursos', 'create'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo concurso em desenvolvimento.' } }));
router.get('/:id/candidatos', authorize('concursos', 'read'), (req, res) => res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Módulo concurso em desenvolvimento.' } }));

module.exports = router;
