function notaRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function porcentaje(nota, max) { return Math.round((nota / max) * 100) }

const retros = [
  'Excelente trabajo, sigue asi.',
  'Buen desempeno, puede mejorar la documentacion.',
  'Correcto pero faltan detalles en la implementacion.',
  'Necesitas reforzar los conceptos teoricos.',
  'Muy buena entrega, bien estructurada.',
  'Regular, revisa los requisitos nuevamente.',
  'Sobresaliente, excelente aplicacion practica.',
  'Aceptable, pero hay errores menores.',
]

// estructura: { cursoId: { estudianteId: { actividadId: { nota, retro } } } }
const calificaciones = {}

// Curso 1 - generar notas para estudiantes
for (let eid = 100; eid <= 114; eid++) {
  if (!calificaciones[1]) calificaciones[1] = {}
  calificaciones[1][eid] = {}

  // Tarea 1 (id 2, nota_max 100)
  const n1 = notaRandom(40, 98)
  calificaciones[1][eid][2] = { nota: n1, porcentaje: porcentaje(n1, 100), retro: retros[Math.floor(Math.random() * retros.length)] }

  // Foro 1 (id 3, nota_max 20)
  if (Math.random() > 0.2) {
    const n3 = notaRandom(10, 20)
    calificaciones[1][eid][3] = { nota: n3, porcentaje: porcentaje(n3, 20), retro: null }
  }

  // Quiz 1 (id 4, nota_max 50)
  if (Math.random() > 0.3) {
    const n4 = notaRandom(15, 50)
    calificaciones[1][eid][4] = { nota: n4, porcentaje: porcentaje(n4, 50), retro: null }
  }

  // Tarea 2 (id 6, nota_max 100) - solo algunos
  if (Math.random() > 0.3) {
    const n6 = notaRandom(30, 95)
    calificaciones[1][eid][6] = { nota: n6, porcentaje: porcentaje(n6, 100), retro: retros[Math.floor(Math.random() * retros.length)] }
  }

  // Quiz 2 (id 8, nota_max 100) - solo algunos
  if (Math.random() > 0.5) {
    const n8 = notaRandom(40, 100)
    calificaciones[1][eid][8] = { nota: n8, porcentaje: porcentaje(n8, 100), retro: null }
  }
}

// Curso 2
for (let eid = 100; eid <= 109; eid++) {
  if (!calificaciones[2]) calificaciones[2] = {}
  calificaciones[2][eid] = {}
  const n15 = notaRandom(30, 95)
  calificaciones[2][eid][16] = { nota: n15, porcentaje: porcentaje(n15, 100), retro: retros[Math.floor(Math.random() * retros.length)] }
}
for (let eid = 115; eid <= 118; eid++) {
  if (!calificaciones[2]) calificaciones[2] = {}
  calificaciones[2][eid] = {}
  const n = notaRandom(40, 90)
  calificaciones[2][eid][16] = { nota: n, porcentaje: porcentaje(n, 100), retro: retros[Math.floor(Math.random() * retros.length)] }
}

// Curso 3
const c3students = [102, 111, 112, 113, 114, 116, 118, 119]
c3students.forEach((eid) => {
  if (!calificaciones[3]) calificaciones[3] = {}
  calificaciones[3][eid] = {}
  if (Math.random() > 0.4) {
    const n = notaRandom(10, 15)
    calificaciones[3][eid][24] = { nota: n, porcentaje: porcentaje(n, 15), retro: null }
  }
})

export default calificaciones
