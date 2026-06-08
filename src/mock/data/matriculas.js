const m = []
let mid = 200

// Curso 1 (SIS-401): 15 estudiantes (ids 100-114)
for (let eid = 100; eid <= 114; eid++) {
  m.push({ id: mid++, curso_id: 1, estudiante_id: eid, fecha_matricula: '2026-02-01', estado: 'activo' })
}

// Curso 2 (SIS-305): 14 estudiantes (ids 100-109, 115-118)
for (let eid = 100; eid <= 109; eid++) {
  m.push({ id: mid++, curso_id: 2, estudiante_id: eid, fecha_matricula: '2026-02-01', estado: 'activo' })
}
for (let eid = 115; eid <= 118; eid++) {
  m.push({ id: mid++, curso_id: 2, estudiante_id: eid, fecha_matricula: '2026-02-02', estado: 'activo' })
}

// Curso 3 (COM-201): 8 estudiantes (ids 102, 111-114, 116-119)
const c3students = [102, 111, 112, 113, 114, 116, 118, 119]
c3students.forEach((eid) => {
  m.push({ id: mid++, curso_id: 3, estudiante_id: eid, fecha_matricula: '2026-02-03', estado: 'activo' })
})

export default m
