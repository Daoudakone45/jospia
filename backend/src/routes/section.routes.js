const express = require('express');
const router = express.Router();

// Liste des 15 sections
const sections = [
  { id: 1, name: 'Primaire 1' },
  { id: 2, name: 'Primaire 2' },
  { id: 3, name: 'Primaire 3' },
  { id: 4, name: 'Primaire 4' },
  { id: 5, name: 'Primaire 5' },
  { id: 6, name: 'Primaire 6' },
  { id: 7, name: 'Collège 1' },
  { id: 8, name: 'Collège 2' },
  { id: 9, name: 'Collège 3' },
  { id: 10, name: 'Collège 4' },
  { id: 11, name: 'Lycée 1' },
  { id: 12, name: 'Lycée 2' },
  { id: 13, name: 'Lycée 3' },
  { id: 14, name: 'Université' },
  { id: 15, name: 'Professionnels' }
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: sections
  });
});

module.exports = router;
