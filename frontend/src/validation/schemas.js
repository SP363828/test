import * as yup from 'yup'
import { BLOQUES, RECURRENCIAS, ESTADOS_RECURSO } from '../utils/constants'

// Las reglas replican las de Joi en el backend para no enviar requests inválidos.
// Los mensajes son claves de i18n: se traducen con t() donde se muestran (Field.jsx).

// Un input type="date" vacío llega como "": se convierte a null para que no sea "Invalid Date".
const fecha = () =>
  yup
    .date()
    .transform((value, original) => (original === '' ? null : value))
    .nullable()
    .typeError('validation.invalidDate')

// Yup interpreta "AAAA-MM-DD" como medianoche UTC, así que "hoy" también se arma en UTC
// (si no, en Uruguay -3h la fecha de hoy quedaría como pasada).
const hoy = () => {
  const d = new Date()
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

export const loginSchema = yup.object().shape({
  username: yup.string().trim().required('validation.usernameRequired'),
  password: yup.string().required('validation.passwordRequired'),
})

export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required('validation.required')
    .matches(/^[a-zA-Z0-9]+$/, 'validation.alphanumeric')
    .min(3, 'validation.min3')
    .max(30, 'validation.max30'),
  email: yup.string().trim().required('validation.required').email('validation.emailInvalid'),
  password: yup
    .string()
    .required('validation.required')
    .min(6, 'validation.min6')
    .matches(/\d/, 'validation.needNumber'),
  passwordRepeat: yup
    .string()
    .required('validation.repeatPassword')
    .oneOf([yup.ref('password')], 'validation.passwordsMismatch'),
  // yup.bool(): solo se valida en el front, no se envía a la API.
  aceptaTerminos: yup.bool().oneOf([true], 'validation.acceptTerms'),
})

export const reservaSchema = yup.object().shape({
  resources: yup.array().of(yup.string()).min(1, 'validation.pickResource'),
  bloques: yup.array().of(yup.string().oneOf(BLOQUES)).min(1, 'validation.pickBlock'),
  tipoRecurrencia: yup.string().oneOf(RECURRENCIAS, 'validation.invalidRecurrence').required('validation.pickRecurrence'),
  fechaInicio: fecha().required('validation.required'),
  // yup.when(): la fecha de fin solo se pide si la reserva se repite.
  fechaFin: fecha().when('tipoRecurrencia', {
    is: 'unica',
    then: (schema) => schema.notRequired(),
    otherwise: (schema) =>
      schema
        .required('validation.endRequired')
        .min(yup.ref('fechaInicio'), 'validation.endAfterStart'),
  }),
})

// Para el alta además no se permiten fechas pasadas.
export const nuevaReservaSchema = reservaSchema.shape({
  fechaInicio: fecha().required('validation.required').min(hoy(), 'validation.pastDate'),
})

export const categoriaSchema = yup.object().shape({
  name: yup.string().trim().required('validation.required').min(3, 'validation.min3').max(100, 'validation.max100'),
  description: yup.string().max(500, 'validation.max500'),
})

const MAX_IMG = 5 * 1024 * 1024

export const recursoSchema = yup.object().shape({
  name: yup.string().trim().required('validation.required').max(100, 'validation.max100'),
  description: yup.string().max(500, 'validation.max500'),
  stock: yup
    .number()
    .typeError('validation.notNumber')
    .required('validation.required')
    .integer('validation.integer')
    .min(0, 'validation.nonNegative'),
  category: yup.string().required('validation.pickCategory'),
  status: yup.string().oneOf(ESTADOS_RECURSO),
  imagen: yup
    .mixed()
    .nullable()
    .test('tipo', 'validation.imageType', (f) => !f || f.type?.startsWith('image/'))
    .test('tamaño', 'validation.imageMax5mb', (f) => !f || f.size <= MAX_IMG),
})

// Convierte los valores del formulario al formato que espera la API.
export const reservaToApi = (data) => ({
  resources: data.resources,
  bloques: data.bloques,
  tipoRecurrencia: data.tipoRecurrencia,
  fechaInicio: data.fechaInicio.toISOString(),
  fechaFin: (data.tipoRecurrencia === 'unica' || !data.fechaFin ? data.fechaInicio : data.fechaFin).toISOString(),
})
