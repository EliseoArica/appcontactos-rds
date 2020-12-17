const { Router } = require('express');
const router = Router();

// Rutas
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;