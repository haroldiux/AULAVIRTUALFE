const estudiantesBase = [
  { nombre: 'Juan Perez Flores', email: 'juan.perez@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=33', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Ana Lucia Vargas', email: 'ana.vargas@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=44', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Pedro Choque Mamani', email: 'pedro.choque@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=53', carrera: 'Ingenieria Comercial' },
  { nombre: 'Maria Rojas Torrico', email: 'maria.rojas@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=22', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Luis Camacho Vera', email: 'luis.camacho@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=8', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Sofia Gutierrez Rios', email: 'sofia.gutierrez@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=23', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Carlos Andrade Soliz', email: 'carlos.andrade@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=12', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Laura Fernandez Pardo', email: 'laura.fernandez@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=10', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Diego Mamani Quispe', email: 'diego.mamani@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=60', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Carmen Vidal Sanchez', email: 'carmen.vidal@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=19', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Roberto Nina Lopez', email: 'roberto.nina@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=51', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Patricia Roca Duran', email: 'patricia.roca@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=24', carrera: 'Ingenieria Comercial' },
  { nombre: 'Jorge Antelo Cruz', email: 'jorge.antelo@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=14', carrera: 'Ingenieria Comercial' },
  { nombre: 'Daniela Paz Hurtado', email: 'daniela.paz@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=36', carrera: 'Ingenieria Comercial' },
  { nombre: 'Miguel Rojas Medina', email: 'miguel.rojas@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=3', carrera: 'Ingenieria Comercial' },
  { nombre: 'Gabriela Mendez Ali', email: 'gabriela.mendez@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=47', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Fernando Salazar Rojas', email: 'fernando.salazar@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=6', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Alejandra Cueva Pinto', email: 'ale.cueva@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=29', carrera: 'Ingenieria de Sistemas' },
  { nombre: 'Oscar Velarde Campero', email: 'oscar.velarde@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=62', carrera: 'Ingenieria Comercial' },
  { nombre: 'Claudia Echeverria Ruiz', email: 'claudia.eche@est.unitech.edu', avatar: 'https://i.pravatar.cc/150?img=38', carrera: 'Ingenieria de Sistemas' },
]

let idCounter = 100
const estudiantes = estudiantesBase.map((e) => ({
  id: idCounter++,
  rol: 'estudiante',
  ...e,
}))

export default [
  {
    id: 1,
    nombre: 'Dr. Carlos Mendoza',
    email: 'carlos.mendoza@unitech.edu',
    rol: 'docente',
    avatar: 'https://i.pravatar.cc/150?img=11',
    sede_id: 1, sede: 'Cochabamba',
    carrera_id: 1, carrera: 'Ingenieria de Sistemas',
    asignaturas: [101, 102],
  },
  {
    id: 2,
    nombre: 'Dra. Maria Rios',
    email: 'maria.rios@unitech.edu',
    rol: 'docente',
    avatar: 'https://i.pravatar.cc/150?img=5',
    sede_id: 1, sede: 'Cochabamba',
    carrera_id: 2, carrera: 'Ingenieria Comercial',
    asignaturas: [103],
  },
  {
    id: 200,
    nombre: 'Lic. Roberto Quispe',
    email: 'roberto.quispe@unitech.edu',
    rol: 'director',
    avatar: 'https://i.pravatar.cc/150?img=12',
    sede_id: 1, sede: 'Cochabamba',
    carreras: [1, 2],
  },
  {
    id: 300,
    nombre: 'Admin Sistema',
    email: 'admin@unitech.edu',
    rol: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=17',
  },
  ...estudiantes,
]
