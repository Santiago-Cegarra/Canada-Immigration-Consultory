import type { CallToAction, Feature, ServiceCategory } from "../types";

/**
 * Contenido de la sección de servicios: la página `/servicios` y las páginas de
 * detalle `/servicios/<categoria>/<proceso>`. Todo se edita aquí; los
 * componentes no llevan texto dentro.
 *
 * ⚠️ TEXTOS PENDIENTES DE REVISIÓN POR EL PROFESIONAL. Las descripciones, los
 * "¿Para quién es?" y los "Qué incluye" de cada trámite son un primer borrador
 * redactado sin revisión de un consultor regulado. Antes de publicar, un
 * profesional debe validarlos. Reglas que siguen y que conviene mantener:
 *   - No prometer resultados ni aprobaciones.
 *   - No citar tiempos de procesamiento ni tarifas del gobierno.
 *   - No citar requisitos de IRCC que puedan cambiar.
 *
 * Cómo editar:
 *   - Cada categoría tiene `slug`, `title`, `icon`, `image` y `processes`.
 *   - Cada proceso tiene `slug`, `title`, `summary` (1–2 frases), `audience`
 *     ("¿Para quién es?", 1–2 frases) e `includes` (3–4 viñetas).
 *   - Los `slug` forman la URL y el de cada proceso debe ser único en todo el
 *     archivo (también viaja en `/agendar?servicio=<slug>`). Cambiar un slug
 *     rompe los enlaces que ya se hayan compartido. Lo comprueba
 *     `services.test.ts`.
 *
 * TODO (imágenes): las `src` actuales son URLs temporales de Google que
 * caducan. Descargarlas a `public/images/servicios/` y sustituirlas por rutas
 * locales. Las categorías con `image: null` todavía no tienen foto: junto a
 * cada una se indica el nombre de archivo esperado.
 */

const categories: ServiceCategory[] = [
  {
    slug: "permisos-de-trabajo",
    title: "Permisos de trabajo",
    icon: "work",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3LS7q76g8ZzQhnAoO--7LSlgLfSfh0Yv9tmkRYhXO_6n1CJfvSseZvgzk49w53HpL1h9WgpmKehtq6STnT8QOXwJXzeP6mgF0QhzxWfccQhBbRwV_YUe9GaYK8L1Y8IIPpcM5FAGJff3t9x9tUr0k5k6oWRXlPPIEs0e85t6w3HaCoqUaG2I9leHDFOhLO3etC83hAg7IqhLjQjRn3GIdMFdTVSFdqbu-SSwFSn5Vs57cB9xVt47C",
      alt: "Profesionales trabajando en una oficina",
    },
    processes: [
      {
        slug: "permisos-abiertos-y-cerrados",
        title: "Permisos abiertos y cerrados",
        summary:
          "Te ayudamos a identificar qué tipo de permiso de trabajo corresponde a tu situación y a preparar la solicitud con orden y claridad.",
        audience:
          "Personas que quieren trabajar en Canadá, ya sea con un empleador específico o con un permiso que no está atado a uno solo.",
        includes: [
          "Revisión de tu perfil y de las opciones de permiso disponibles para tu caso.",
          "Lista personalizada de documentos y revisión de cada uno.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento del expediente y respuesta a comunicaciones de la autoridad migratoria.",
        ],
      },
      {
        slug: "extension-permiso-de-trabajo",
        title: "Extensiones y renovaciones",
        summary:
          "Preparamos la solicitud para extender o renovar tu permiso de trabajo y te explicamos cómo queda tu estatus mientras se tramita.",
        audience:
          "Trabajadores que ya están en Canadá y cuyo permiso está próximo a vencer o necesita actualizarse.",
        includes: [
          "Revisión de tu permiso actual y de tus fechas clave.",
          "Lista de documentos y revisión de la información del empleador, cuando aplica.",
          "Preparación y presentación de la solicitud de extensión.",
          "Seguimiento hasta la decisión.",
        ],
      },
      {
        slug: "permisos-para-conyuges-o-parejas",
        title: "Permisos para cónyuges o parejas",
        summary:
          "Asesoramos a cónyuges y parejas de hecho de trabajadores o estudiantes que desean solicitar su propio permiso de trabajo.",
        audience:
          "Parejas de personas que estudian o trabajan en Canadá y quieren saber si pueden trabajar durante su estadía.",
        includes: [
          "Evaluación de la situación de ambos miembros de la pareja.",
          "Orientación sobre cómo documentar la relación.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "permisos-asociados-a-refugio-o-sponsorship",
        title: "Permisos asociados a refugio o sponsorship",
        summary:
          "Te acompañamos a solicitar el permiso de trabajo vinculado a tu solicitud de refugio o a tu proceso de patrocinio familiar.",
        audience:
          "Personas con una solicitud de refugio o de sponsorship en curso que necesitan trabajar mientras esperan una decisión.",
        includes: [
          "Revisión del estado de tu proceso principal.",
          "Preparación de la solicitud del permiso de trabajo asociado.",
          "Revisión de documentos de identidad y soporte.",
          "Seguimiento y orientación sobre la renovación.",
        ],
      },
      {
        slug: "pgwp",
        title: "PGWP: solicitud inicial y extensión por pasaporte",
        summary:
          "Preparamos tu solicitud de permiso de trabajo posgraduación y, si se emitió por menos tiempo debido a la vigencia del pasaporte, la solicitud para completarlo.",
        audience:
          "Graduados de instituciones canadienses que quieren trabajar en Canadá después de terminar sus estudios.",
        includes: [
          "Revisión de tu historial de estudios y de la documentación de la institución.",
          "Preparación y presentación de la solicitud.",
          "Orientación sobre tu estatus mientras esperas la respuesta.",
          "Solicitud de extensión cuando el permiso quedó limitado por el pasaporte.",
        ],
      },
      {
        slug: "bridging-open-work-permit",
        title: "Bridging Open Work Permit (BOWP)",
        summary:
          "Te asesoramos para solicitar el permiso puente que permite seguir trabajando mientras se resuelve tu solicitud de residencia permanente.",
        audience:
          "Personas con una solicitud de residencia permanente en trámite cuyo permiso de trabajo actual está por vencer.",
        includes: [
          "Revisión del estado de tu solicitud de residencia permanente.",
          "Evaluación de si el permiso puente es la opción adecuada para tu caso.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "permisos-para-trabajadores-vulnerables",
        title: "Permisos para trabajadores vulnerables",
        summary:
          "Acompañamos con confidencialidad a trabajadores que enfrentan abuso o riesgo de abuso en su empleo y necesitan un permiso que les permita cambiar de empleador.",
        audience:
          "Trabajadores con un permiso ligado a un empleador que viven una situación de abuso o temen sufrirla.",
        includes: [
          "Conversación confidencial para entender tu situación.",
          "Orientación sobre cómo documentar lo ocurrido.",
          "Preparación de la solicitud y de la carta explicativa.",
          "Seguimiento y orientación sobre los pasos siguientes.",
        ],
      },
      {
        slug: "international-experience-canada",
        title:
          "International Experience Canada (Working Holiday y Young Professionals)",
        summary:
          "Te guiamos en el programa de movilidad para jóvenes, desde la creación del perfil hasta la solicitud del permiso de trabajo.",
        audience:
          "Jóvenes de países con acuerdo de movilidad con Canadá que desean vivir una experiencia laboral temporal.",
        includes: [
          "Revisión de las categorías disponibles según tu nacionalidad.",
          "Acompañamiento en la creación del perfil.",
          "Preparación de la solicitud del permiso tras recibir la invitación.",
          "Orientación para tu llegada a Canadá.",
        ],
      },
      {
        slug: "restauracion-de-estatus-trabajador",
        title: "Restauración de estatus como trabajador",
        summary:
          "Si tu permiso de trabajo venció, analizamos tu caso y preparamos la solicitud para restaurar tu estatus.",
        audience:
          "Trabajadores que perdieron su estatus en Canadá y quieren regularizar su situación.",
        includes: [
          "Análisis de tus fechas y de las opciones disponibles.",
          "Explicación clara de lo que puedes y no puedes hacer durante el trámite.",
          "Preparación de la solicitud y de la carta explicativa.",
          "Seguimiento del expediente.",
        ],
      },
    ],
  },
  {
    slug: "visas-de-visitante",
    title: "Visas de visitante y estadía en Canadá",
    icon: "flight_takeoff",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvM4pdfeUEh8f3tQFLBdnN_UzxbfoG88ABZtubwnVPIzJ03iVEn9PwWQIoc9kgNpqehjDvw5QI3P30ruKP1FOwZmU_XZ_sipnBtNEehAhen1jqqkvcEjrSldif0qDiWQD5imkgxic96Sq2_V37S4edwEgDmUhUSdwSp2GYeJDU4mjrbXXO-oyXAvt2fsq5EKxGOKK4S6X-tuIzJIA-mmG8QCvisgacUUwseq2kYNOSZSGfUsYWewy2",
      alt: "Paisaje canadiense",
    },
    processes: [
      {
        slug: "visitor-visa",
        title:
          "Visitor Visa (turismo, visita familiar o estudios de corta duración)",
        summary:
          "Preparamos tu solicitud de visa de visitante cuidando que el propósito del viaje y tu situación queden bien explicados.",
        audience:
          "Personas que desean viajar a Canadá por turismo, para visitar familiares o para un curso corto.",
        includes: [
          "Revisión de tu perfil y del propósito del viaje.",
          "Lista personalizada de documentos de soporte.",
          "Preparación de formularios y de la carta explicativa.",
          "Presentación de la solicitud y seguimiento.",
        ],
      },
      {
        slug: "visitor-record",
        title: "Extensión de estadía (Visitor Record)",
        summary:
          "Te ayudamos a solicitar la extensión de tu estadía como visitante antes de que venza tu estatus actual.",
        audience:
          "Visitantes que ya están en Canadá y necesitan permanecer más tiempo.",
        includes: [
          "Revisión de tu estatus y de tus fechas clave.",
          "Preparación de la solicitud y de la carta explicativa.",
          "Revisión de los documentos de soporte.",
          "Seguimiento hasta la decisión.",
        ],
      },
      {
        slug: "cambio-a-visitante",
        title: "Cambio de estudiante o trabajador a visitante",
        summary:
          "Preparamos la solicitud para cambiar tu estatus a visitante cuando terminan tus estudios o tu empleo y deseas permanecer en Canadá.",
        audience:
          "Estudiantes o trabajadores cuyo permiso está por terminar y que quieren quedarse como visitantes.",
        includes: [
          "Evaluación de tu situación actual y de tus opciones.",
          "Preparación de la solicitud de cambio de estatus.",
          "Carta explicativa y revisión de documentos.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "super-visa",
        title: "Super Visa para padres y abuelos",
        summary:
          "Asesoramos a las familias que desean traer de visita a sus padres o abuelos por períodos prolongados.",
        audience:
          "Ciudadanos y residentes permanentes de Canadá que quieren invitar a sus padres o abuelos.",
        includes: [
          "Revisión de la situación del familiar que invita y de la persona invitada.",
          "Orientación sobre la documentación que respalda la invitación.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "eta",
        title: "Autorización electrónica de viaje (eTA)",
        summary:
          "Te orientamos para confirmar si necesitas una eTA y la solicitamos contigo de forma correcta.",
        audience:
          "Viajeros que llegan a Canadá por vía aérea y no requieren visa de visitante.",
        includes: [
          "Verificación de qué documento de viaje corresponde a tu caso.",
          "Acompañamiento para completar la solicitud.",
          "Revisión de la información antes de enviarla.",
        ],
      },
      {
        slug: "restauracion-de-estatus-visitante",
        title: "Restauración de estatus como visitante",
        summary:
          "Si tu estatus de visitante venció, revisamos tu caso y preparamos la solicitud para restaurarlo.",
        audience:
          "Visitantes que permanecen en Canadá con el estatus vencido y quieren regularizar su situación.",
        includes: [
          "Análisis de tus fechas y de las opciones disponibles.",
          "Preparación de la solicitud y de la carta explicativa.",
          "Revisión de los documentos de soporte.",
          "Seguimiento del expediente.",
        ],
      },
    ],
  },
  {
    slug: "refugio-y-proteccion",
    title: "Refugio y protección",
    icon: "shield",
    // Imagen pendiente: public/images/servicios/refugio-y-proteccion.jpg
    image: null,
    processes: [
      {
        slug: "solicitudes-de-refugio",
        title: "Solicitudes de refugio",
        summary:
          "Te acompañamos con respeto y confidencialidad en la preparación y presentación de tu solicitud de protección en Canadá.",
        audience:
          "Personas que temen regresar a su país y buscan protección en Canadá.",
        includes: [
          "Conversación inicial confidencial para entender tu situación.",
          "Explicación de las etapas del proceso.",
          "Preparación de los formularios y documentos de la solicitud.",
          "Acompañamiento en cada etapa del proceso.",
        ],
      },
      {
        slug: "relato-boc-y-pruebas",
        title: "Preparación del relato, BOC y pruebas",
        summary:
          "Te ayudamos a ordenar tu historia y a preparar el formulario de fundamento de la solicitud (BOC) junto con las pruebas que la respaldan.",
        audience:
          "Solicitantes de refugio que necesitan presentar su relato y su evidencia de forma clara y coherente.",
        includes: [
          "Sesiones de trabajo para organizar tu relato.",
          "Redacción y revisión del BOC.",
          "Orientación sobre las pruebas y su organización.",
          "Coordinación de traducciones cuando hacen falta.",
        ],
      },
      {
        slug: "audiencias-ante-la-rpd",
        title: "Preparación y representación en audiencias ante la RPD",
        summary:
          "Te preparamos para tu audiencia ante la División de Protección de Refugiados y te representamos ese día.",
        audience:
          "Solicitantes de refugio que tienen una audiencia programada o esperan su fecha.",
        includes: [
          "Revisión completa de tu expediente.",
          "Sesiones de preparación para la audiencia.",
          "Presentación de pruebas y documentos dentro de los plazos.",
          "Representación durante la audiencia.",
        ],
      },
      {
        slug: "apelaciones-ante-la-rad",
        title: "Apelaciones ante la RAD",
        summary:
          "Analizamos la decisión negativa y, si corresponde, preparamos tu apelación ante la División de Apelaciones de Refugiados.",
        audience:
          "Personas que recibieron una decisión negativa en su solicitud de refugio.",
        includes: [
          "Análisis de la decisión y de los motivos de la negativa.",
          "Evaluación de las opciones disponibles.",
          "Preparación de los argumentos y del expediente de apelación.",
          "Seguimiento del proceso.",
        ],
      },
      {
        slug: "prra",
        title: "Evaluación de riesgo antes de la expulsión (PRRA)",
        summary:
          "Preparamos tu solicitud de evaluación de riesgo, explicando con evidencia por qué regresar a tu país te pondría en peligro.",
        audience:
          "Personas que enfrentan una orden de salida de Canadá y temen por su seguridad si regresan.",
        includes: [
          "Revisión de tu historial migratorio.",
          "Preparación de la solicitud y de los argumentos escritos.",
          "Orientación sobre las pruebas y su organización.",
          "Seguimiento del expediente.",
        ],
      },
    ],
  },
  {
    slug: "residencia-permanente",
    title: "Residencia permanente",
    icon: "home",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-PDlanwvYuzDAOw1WX9Yo3eA1SMdOOOdFZCrkg_ywZCtKxjITny95tKLZk4003J2zxdENKkYZMn1JcQxVI6n-bn1aO_YJjUbGSbE9gqQvgFr-p9z8W94fcOGPS92Jgw5o8g0CSkazmti2mA9x3iMMu_883mMvOb4v9JVZYPQPTXuJbuI91furHrwgY6YpTgsQTPt6EjLMwK-FmLJQ6X0_skKXmgmLSDPSrEVWr-q6BvF9ePEZV4Zc",
      alt: "Horizonte de la ciudad de Toronto",
    },
    processes: [
      {
        slug: "residencia-para-personas-protegidas",
        title:
          "Residencia permanente para personas protegidas y sus familiares",
        summary:
          "Preparamos la solicitud de residencia permanente una vez reconocida tu condición de persona protegida, incluyendo a los familiares que correspondan.",
        audience:
          "Personas a quienes Canadá reconoció como refugiadas o protegidas, y sus familiares.",
        includes: [
          "Revisión de tu decisión de protección y de tu grupo familiar.",
          "Lista de documentos y revisión de cada uno.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "express-entry",
        title:
          "Express Entry (evaluación, creación del perfil y solicitud después de la invitación)",
        summary:
          "Te acompañamos en todo el recorrido de Express Entry: evaluamos tu perfil, lo creamos contigo y preparamos la solicitud si recibes una invitación.",
        audience:
          "Trabajadores calificados, dentro o fuera de Canadá, que quieren saber si este sistema es una vía para ellos.",
        includes: [
          "Evaluación inicial de tu perfil.",
          "Orientación sobre los documentos que conviene preparar con antelación.",
          "Creación y actualización del perfil.",
          "Preparación de la solicitud después de la invitación.",
        ],
      },
      {
        slug: "nominacion-provincial",
        title: "Nominación provincial (PNP / OINP)",
        summary:
          "Analizamos qué programas provinciales se ajustan a tu perfil y preparamos la solicitud de nominación y la de residencia permanente.",
        audience:
          "Personas con experiencia, estudios o una oferta de empleo vinculados a una provincia canadiense.",
        includes: [
          "Comparación de las corrientes provinciales disponibles para tu perfil.",
          "Preparación de la solicitud ante la provincia.",
          "Solicitud de residencia permanente tras la nominación.",
          "Seguimiento en ambas etapas.",
        ],
      },
      {
        slug: "razones-humanitarias-y-compasivas",
        title: "Razones humanitarias y compasivas (H&C)",
        summary:
          "Preparamos solicitudes basadas en circunstancias humanitarias, presentando con cuidado tu historia y tu arraigo en Canadá.",
        audience:
          "Personas en situaciones excepcionales que no encajan en otros programas de residencia.",
        includes: [
          "Evaluación franca de tu caso y de sus riesgos.",
          "Orientación sobre las pruebas de establecimiento y de dificultades.",
          "Redacción de los argumentos escritos.",
          "Presentación de la solicitud y seguimiento.",
        ],
      },
      {
        slug: "programas-especiales",
        title:
          "Programas especiales y seguimiento de expedientes de programas anteriores",
        summary:
          "Revisamos si calificas para programas temporales o especiales y damos continuidad a solicitudes presentadas bajo programas que ya cerraron.",
        audience:
          "Personas interesadas en un programa especial o con un expediente en curso de un programa anterior.",
        includes: [
          "Revisión de los programas vigentes aplicables a tu caso.",
          "Diagnóstico del estado de tu expediente actual.",
          "Preparación de solicitudes o de respuestas pendientes.",
          "Seguimiento del expediente.",
        ],
      },
    ],
  },
  {
    slug: "patrocinio-familiar",
    title: "Patrocinio y reunificación familiar",
    icon: "family_restroom",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfNWUE_Lqz7rCS1d9CV7Xoq2WLtCUHOKoyNW-2PThF3oJQmTLqLPE5PuGwJieC--LOAlShBlvkQW0OF3DFvIpTdbHjg8az8c1ugTGON2dVHCVM1mjRygMt_tvsWOD7F6HAuhSukUNE8w_6fbnCRTdczZFxSlQ-gHIAtZrWspBrJHKxbSi7lcDiBvm4Fpn_qG4GgZ3zoGVsS8klKpnEFBAIKwX4Gzx6dI6hhv-DVke_-wV6nHWNb41v",
      alt: "Familia feliz en Canadá",
    },
    processes: [
      {
        slug: "sponsorship-de-esposo",
        title: "Sponsorship de esposo/a",
        summary:
          "Acompañamos a las parejas casadas en la solicitud de patrocinio, cuidando que la relación quede bien documentada.",
        audience:
          "Ciudadanos o residentes permanentes de Canadá que desean patrocinar a su esposo o esposa.",
        includes: [
          "Evaluación de la situación del patrocinador y de la persona patrocinada.",
          "Guía para reunir las pruebas de la relación.",
          "Preparación de formularios y presentación de la solicitud.",
          "Seguimiento y respuesta a requerimientos.",
        ],
      },
      {
        slug: "sponsorship-de-pareja-de-hecho",
        title: "Sponsorship de pareja de hecho (Common-law)",
        summary:
          "Asesoramos a parejas de hecho en su solicitud de patrocinio, con especial atención a cómo demostrar la convivencia.",
        audience:
          "Ciudadanos o residentes permanentes de Canadá que desean patrocinar a su pareja de hecho.",
        includes: [
          "Evaluación de la relación y de la convivencia.",
          "Guía para reunir las pruebas de vida en común.",
          "Preparación de formularios y presentación de la solicitud.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "patrocinio-dentro-y-fuera-de-canada",
        title: "Solicitudes dentro y fuera de Canadá",
        summary:
          "Te explicamos las diferencias entre presentar el patrocinio desde dentro o desde fuera de Canadá y preparamos la vía que mejor se ajuste a tu familia.",
        audience:
          "Parejas que no saben qué modalidad de patrocinio les conviene según dónde vive cada uno.",
        includes: [
          "Comparación de ambas modalidades aplicada a tu caso.",
          "Orientación sobre el permiso de trabajo de la persona patrocinada, cuando aplica.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "patrocinio-de-hijos-dependientes",
        title: "Patrocinio de hijos dependientes",
        summary:
          "Preparamos el patrocinio de tus hijos dependientes para que puedan reunirse contigo en Canadá.",
        audience:
          "Padres y madres ciudadanos o residentes permanentes con hijos dependientes en otro país.",
        includes: [
          "Revisión de la situación de cada hijo.",
          "Orientación sobre documentos de filiación y custodia.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "patrocinio-de-padres-y-abuelos",
        title:
          "Patrocinio de padres y abuelos, según disponibilidad del programa",
        summary:
          "Te orientamos sobre el programa de patrocinio de padres y abuelos y preparamos la solicitud cuando el programa está abierto y recibes una invitación.",
        audience:
          "Ciudadanos y residentes permanentes que desean traer a sus padres o abuelos a vivir a Canadá.",
        includes: [
          "Explicación de cómo funciona el programa y de su disponibilidad.",
          "Revisión de la situación del patrocinador.",
          "Preparación de la solicitud tras la invitación.",
          "Orientación sobre alternativas como la Super Visa.",
        ],
      },
    ],
  },
  {
    slug: "estudios-en-canada",
    title: "Estudios en Canadá",
    icon: "school",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdnc9kFiL4A2YZDy3pqpz4kI4Ot9gnsSQ0Yr786y6assmwtC3T5yx134hfW7n-6MebWViE4YZnT-SMDZZlpYH4c8g_SxcLMI2VSXt06_KvnfgWRFAD4QapP79S9_yLo0NgcBLGh_vrjHAiKcifeEEuqzFnkkkxQq5yogGeK8VAcsDpenJM50tvsJ2SeslVcRFg5SNyqYYWn4ahiyXieu9rNSEPaV9NmKKvyQRCUdxCOEcbrZr_U06R",
      alt: "Estudiantes internacionales en Canadá",
    },
    processes: [
      {
        slug: "permisos-de-estudio",
        title: "Permisos de estudio para adultos y menores",
        summary:
          "Preparamos la solicitud de permiso de estudio con un plan de estudios coherente y la documentación ordenada.",
        audience:
          "Personas admitidas, o por ser admitidas, en una institución canadiense, y familias con hijos menores que estudiarán en Canadá.",
        includes: [
          "Revisión de tu perfil y de tu plan de estudios.",
          "Lista de documentos y orientación sobre el soporte financiero.",
          "Preparación de formularios y de la carta explicativa.",
          "Presentación de la solicitud y seguimiento.",
        ],
      },
      {
        slug: "extension-permiso-de-estudio",
        title: "Extensiones de permisos de estudio",
        summary:
          "Te ayudamos a extender tu permiso de estudio para que puedas continuar o terminar tu programa.",
        audience:
          "Estudiantes en Canadá cuyo permiso vence antes de completar sus estudios.",
        includes: [
          "Revisión de tu permiso y de tu situación académica.",
          "Lista de documentos actualizada.",
          "Preparación y presentación de la extensión.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "restauracion-de-estatus-estudiante",
        title: "Restauración de estatus como estudiante",
        summary:
          "Si tu permiso de estudio venció, analizamos tu caso y preparamos la solicitud para restaurar tu estatus.",
        audience:
          "Estudiantes que perdieron su estatus y desean continuar sus estudios en Canadá.",
        includes: [
          "Análisis de tus fechas y de las opciones disponibles.",
          "Explicación clara de lo que puedes y no puedes hacer durante el trámite.",
          "Preparación de la solicitud y de la carta explicativa.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "asesoria-de-programas-de-estudio",
        title: "Asesoría para programas de idiomas, college y otros estudios",
        summary:
          "Te orientamos para elegir un programa y una institución acordes con tus objetivos académicos y migratorios.",
        audience:
          "Personas que quieren estudiar en Canadá y aún no deciden qué programa o institución elegir.",
        includes: [
          "Conversación sobre tus objetivos y tu presupuesto.",
          "Comparación de opciones de programas e instituciones.",
          "Explicación de cómo se relaciona cada opción con tus planes migratorios.",
        ],
      },
      {
        slug: "coordinacion-de-admisiones",
        title: "Coordinación de admisiones con instituciones educativas",
        summary:
          "Gestionamos contigo el proceso de admisión ante la institución educativa que elijas.",
        audience:
          "Futuros estudiantes que desean apoyo para completar su admisión.",
        includes: [
          "Preparación del expediente de admisión.",
          "Comunicación con la institución educativa.",
          "Seguimiento hasta recibir la carta de aceptación.",
          "Orientación sobre los pasos posteriores a la admisión.",
        ],
      },
    ],
  },
  {
    slug: "empleadores",
    title: "Servicios para empleadores y contratación internacional",
    icon: "apartment",
    image: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCembifzwAaw0z7O1Rwp1hEGkhngyD1hLmm-lHIDIM8cdzd3NIWtUyU6MoLTScZMImJte5MRk7fIaOT_5LAyvTdaBcaF6p85Qewiklqlld1WVyRDnrongiijk_eWl891DAGaSnlihfuOhmUjF3Zsvp4e6n9HNuM-1S_s_KDVoTP3NIL2ImGA5_uhGuc7VZ1ypSJY-vk_OUWkpS5MnGtBCXyi6Utv_7bcxHc_CEnCQRJYpQiHXEHlrbV",
      alt: "Oficina moderna",
    },
    processes: [
      {
        slug: "solicitudes-lmia",
        title: "Solicitudes LMIA",
        summary:
          "Preparamos la solicitud de Evaluación de Impacto en el Mercado Laboral para que tu empresa pueda contratar talento extranjero.",
        audience:
          "Empleadores canadienses que necesitan contratar a un trabajador extranjero para un puesto.",
        includes: [
          "Revisión del puesto y de la situación de la empresa.",
          "Plan del proceso y de la documentación necesaria.",
          "Preparación y presentación de la solicitud.",
          "Seguimiento y apoyo ante comunicaciones de la autoridad.",
        ],
      },
      {
        slug: "evaluacion-del-empleador",
        title: "Evaluación del empleador, puesto y condiciones laborales",
        summary:
          "Revisamos la empresa, el puesto y las condiciones ofrecidas antes de iniciar un proceso de contratación internacional.",
        audience:
          "Empleadores que quieren saber si están listos para contratar personal extranjero.",
        includes: [
          "Revisión de la documentación de la empresa.",
          "Análisis del puesto y de sus funciones.",
          "Revisión de las condiciones laborales ofrecidas.",
          "Recomendaciones antes de presentar cualquier solicitud.",
        ],
      },
      {
        slug: "reclutamiento-y-documentacion",
        title: "Publicaciones y documentación del reclutamiento",
        summary:
          "Te guiamos para realizar y documentar los esfuerzos de reclutamiento que respaldan la contratación.",
        audience:
          "Empleadores que deben demostrar sus esfuerzos de reclutamiento.",
        includes: [
          "Orientación sobre el contenido de las publicaciones.",
          "Seguimiento de los avisos mientras están activos.",
          "Registro ordenado de candidatos y resultados.",
          "Organización de la evidencia para la solicitud.",
        ],
      },
      {
        slug: "permisos-exentos-de-lmia",
        title:
          "Permisos exentos de LMIA (tratados internacionales, Movilidad Francófona y otras categorías)",
        summary:
          "Analizamos si el puesto o el trabajador pueden acogerse a una categoría exenta de LMIA y preparamos el proceso correspondiente.",
        audience:
          "Empleadores y trabajadores cuya situación podría encajar en una categoría de exención.",
        includes: [
          "Análisis de las categorías de exención aplicables.",
          "Preparación de la oferta de empleo.",
          "Orientación sobre los documentos del trabajador.",
          "Coordinación de la solicitud del permiso de trabajo.",
        ],
      },
      {
        slug: "employer-portal",
        title: "Gestión de ofertas en el Employer Portal",
        summary:
          "Te apoyamos con el registro de la empresa y la presentación de ofertas de empleo en el portal de empleadores.",
        audience:
          "Empleadores que contratan bajo categorías que requieren presentar la oferta en el portal.",
        includes: [
          "Apoyo en el registro de la empresa en el portal.",
          "Carga y revisión de la oferta de empleo.",
          "Verificación de la información antes de enviarla.",
          "Entrega al trabajador de los datos que necesita para su solicitud.",
        ],
      },
      {
        slug: "permisos-del-personal-extranjero",
        title:
          "Coordinación de los permisos de trabajo del personal extranjero",
        summary:
          "Coordinamos las solicitudes de permiso de trabajo de las personas que tu empresa va a contratar.",
        audience:
          "Empresas que incorporan a uno o varios trabajadores extranjeros.",
        includes: [
          "Plan de trabajo para cada contratación.",
          "Preparación de las solicitudes de permiso.",
          "Comunicación con el trabajador y con el empleador.",
          "Seguimiento de vencimientos y renovaciones.",
        ],
      },
    ],
  },
  {
    slug: "revision-de-casos",
    title: "Revisión de casos, negativas y expedientes",
    icon: "description",
    // Imagen pendiente: public/images/servicios/revision-de-casos.jpg
    image: null,
    processes: [
      {
        slug: "consulta-y-planificacion-migratoria",
        title: "Consultas y planificación migratoria",
        summary:
          "Una sesión para revisar tu situación, resolver dudas y trazar un plan migratorio realista.",
        audience:
          "Personas que quieren entender sus opciones antes de iniciar cualquier trámite.",
        includes: [
          "Revisión de tu perfil y de tu historial migratorio.",
          "Explicación de las vías posibles y de sus riesgos.",
          "Plan de acción con los pasos recomendados.",
          "Respuesta a tus preguntas.",
        ],
      },
      {
        slug: "analisis-de-negativas",
        title: "Análisis de negativas, nuevas solicitudes y reconsideraciones",
        summary:
          "Estudiamos los motivos de la negativa y te recomendamos el camino a seguir: una nueva solicitud, una reconsideración u otra vía.",
        audience:
          "Personas que recibieron una negativa y quieren saber qué hacer ahora.",
        includes: [
          "Revisión de la carta de negativa y, si las tienes, de las notas del oficial.",
          "Identificación de los puntos débiles de la solicitud anterior.",
          "Recomendación de la estrategia a seguir.",
          "Preparación de la nueva solicitud o del pedido de reconsideración.",
        ],
      },
      {
        slug: "requerimientos-y-cartas-de-equidad-procesal",
        title: "Respuestas a requerimientos y cartas de equidad procesal (PFL)",
        summary:
          "Preparamos una respuesta completa y dentro del plazo a los requerimientos y cartas de equidad procesal que recibas.",
        audience:
          "Solicitantes que recibieron una comunicación de la autoridad migratoria pidiendo información o explicaciones.",
        includes: [
          "Análisis de la carta y de las preocupaciones del oficial.",
          "Plan de respuesta ajustado al plazo indicado.",
          "Redacción de la respuesta y organización de las pruebas.",
          "Presentación y seguimiento.",
        ],
      },
      {
        slug: "autorizacion-para-regresar-a-canada",
        title: "Autorización para regresar a Canadá (ARC)",
        summary:
          "Te asesoramos para solicitar la autorización que se requiere para volver a Canadá después de ciertas órdenes de salida.",
        audience:
          "Personas que recibieron una orden de salida de Canadá y desean regresar.",
        includes: [
          "Revisión de tu historial y del tipo de orden recibida.",
          "Evaluación de tu caso.",
          "Preparación de la solicitud y de la carta explicativa.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "atip-gcms-y-correcciones",
        title: "ATIP, notas GCMS, webforms y correcciones de expedientes",
        summary:
          "Solicitamos la información de tu expediente, te explicamos qué dice y gestionamos consultas o correcciones cuando hacen falta.",
        audience:
          "Solicitantes que quieren conocer el estado real de su expediente o corregir un dato.",
        includes: [
          "Solicitud de las notas de tu expediente.",
          "Explicación de las notas en un lenguaje claro.",
          "Envío de consultas a través de los canales oficiales.",
          "Solicitudes de corrección de datos.",
        ],
      },
    ],
  },
  {
    slug: "ciudadania-y-documentos",
    title: "Ciudadanía, documentos y trámites complementarios",
    icon: "badge",
    // Imagen pendiente: public/images/servicios/ciudadania-y-documentos.jpg
    image: null,
    processes: [
      {
        slug: "ciudadania-canadiense",
        title: "Solicitudes de ciudadanía canadiense",
        summary:
          "Revisamos tu historial de residencia y preparamos tu solicitud de ciudadanía.",
        audience:
          "Residentes permanentes que quieren dar el paso hacia la ciudadanía.",
        includes: [
          "Revisión de tu historial de presencia en Canadá.",
          "Lista de documentos y revisión de cada uno.",
          "Preparación y presentación de la solicitud.",
          "Orientación para el examen y la ceremonia.",
        ],
      },
      {
        slug: "pr-card",
        title: "Renovación y reemplazo de PR Card",
        summary:
          "Te ayudamos a renovar tu tarjeta de residente permanente o a reemplazarla si se perdió, fue robada o tiene errores.",
        audience:
          "Residentes permanentes con la tarjeta vencida, por vencer o extraviada.",
        includes: [
          "Revisión de tu historial de residencia.",
          "Preparación de la solicitud.",
          "Revisión de fotografías y documentos.",
          "Seguimiento del expediente.",
        ],
      },
      {
        slug: "refugee-travel-document",
        title: "Refugee Travel Document",
        summary:
          "Preparamos la solicitud del documento de viaje para personas protegidas.",
        audience:
          "Personas protegidas en Canadá que necesitan viajar al exterior.",
        includes: [
          "Revisión de tu situación y de tus planes de viaje.",
          "Preparación de la solicitud.",
          "Revisión de fotografías y documentos.",
          "Orientación sobre los cuidados a tener al viajar.",
        ],
      },
      {
        slug: "renovacion-de-pasaportes",
        title: "Asistencia con renovación de pasaportes",
        summary:
          "Te orientamos con el trámite de renovación de tu pasaporte ante la autoridad que corresponda.",
        audience:
          "Personas que necesitan renovar su pasaporte y prefieren hacerlo con acompañamiento.",
        includes: [
          "Orientación sobre el trámite según tu nacionalidad.",
          "Revisión de formularios y fotografías.",
          "Apoyo para solicitar la cita, cuando aplica.",
        ],
      },
      {
        slug: "visa-de-visitante-estados-unidos",
        title: "Visa de visitante para Estados Unidos",
        summary:
          "Te asistimos para completar tu solicitud de visa de visitante a Estados Unidos y prepararte para la entrevista.",
        audience:
          "Residentes en Canadá que desean viajar a Estados Unidos y necesitan visa.",
        includes: [
          "Apoyo para completar el formulario de solicitud.",
          "Orientación para programar la cita.",
          "Preparación para la entrevista.",
        ],
      },
      {
        slug: "traducciones-y-servicios-notariales",
        title:
          "Traducciones, interpretación, declaraciones juradas y servicios notariales",
        summary:
          "Coordinamos traducciones, interpretación y servicios notariales para que tus documentos estén listos para tu trámite.",
        audience:
          "Personas que necesitan documentos traducidos, certificados o declaraciones juradas.",
        includes: [
          "Traducción de documentos para tu trámite.",
          "Interpretación en citas y gestiones.",
          "Preparación de declaraciones juradas.",
          "Coordinación con el profesional autorizado para la certificación.",
        ],
      },
      {
        slug: "verificacion-de-estatus-y-certificados",
        title:
          "Verificación de estatus (VOS), documentos de refugio y certificados policiales",
        summary:
          "Te ayudamos a solicitar documentos oficiales que suelen pedirse en otros trámites.",
        audience:
          "Personas que necesitan reemplazar un documento migratorio o reunir certificados para una solicitud.",
        includes: [
          "Identificación del documento que necesitas.",
          "Preparación de la solicitud.",
          "Orientación para obtener certificados policiales.",
          "Seguimiento del trámite.",
        ],
      },
      {
        slug: "sin-tarjeta-de-salud-y-otros-tramites",
        title:
          "Asistencia con SIN, tarjeta de salud y otros trámites administrativos",
        summary:
          "Te acompañamos con los trámites prácticos de la vida en Canadá.",
        audience:
          "Recién llegados y personas que necesitan ayuda con gestiones administrativas.",
        includes: [
          "Orientación sobre dónde y cómo realizar cada trámite.",
          "Apoyo con formularios y citas.",
          "Revisión de los documentos que debes presentar.",
        ],
      },
      {
        slug: "registro-comercial-y-divorcio",
        title:
          "Registro comercial y divorcio simple o conjunto, mediante el profesional correspondiente",
        summary:
          "Te conectamos con el profesional adecuado y coordinamos contigo el registro de un negocio o un divorcio simple o conjunto.",
        audience:
          "Personas que desean registrar un negocio o tramitar un divorcio sin disputa.",
        includes: [
          "Orientación inicial sobre el trámite.",
          "Coordinación con el profesional correspondiente.",
          "Apoyo para reunir los documentos.",
          "Seguimiento hasta completar la gestión.",
        ],
      },
    ],
  },
];

const headerAction: CallToAction = {
  label: "Obtén una Evaluación de Perfil",
  href: "/agendar",
  icon: "arrow_forward",
};

const reasons: Feature[] = [
  {
    icon: "verified_user",
    title: "Consultores Regulados",
    description:
      "Contamos con profesionales autorizados por el CICC para garantizar un proceso legal y seguro.",
  },
  {
    icon: "strategy",
    title: "Estrategia Personalizada",
    description:
      "Analizamos cada caso individualmente para encontrar la vía migratoria con mayor probabilidad de éxito.",
  },
  {
    icon: "visibility",
    title: "Transparencia Total",
    description:
      "Sin costos ocultos ni promesas falsas. Te mantenemos informado en cada etapa de tu aplicación.",
  },
];

const ctaAction: CallToAction = {
  label: "Comenzar Evaluación Inicial Gratuita",
  href: "/agendar",
  icon: "assignment",
};

export const serviciosContent = {
  /** Metadatos SEO. El título se completa con " — Help Immigration Canada". */
  seo: {
    title: "Servicios",
    description:
      "Servicios migratorios para Canadá: permisos de trabajo y estudio, visas de visitante, refugio, residencia permanente, patrocinio familiar, ciudadanía y más.",
  },
  header: {
    eyebrow: "Nuestros Servicios",
    title: "Programas de Estudio y Migración",
    description:
      "Soluciones migratorias estratégicas diseñadas para profesionales, estudiantes y familias buscando establecerse en Canadá.",
    action: headerAction,
  },
  catalog: {
    categories,
    /** Texto bajo el título de cada tarjeta. `{count}` es el número de trámites. */
    countLabel: { one: "{count} trámite", other: "{count} trámites" },
    /** Texto del botón que cierra el panel abierto. */
    closeLabel: "Cerrar",
    /** Nombre accesible del listado de categorías. */
    listLabel: "Categorías de servicios",
  },
  /** Textos fijos de la página de detalle de un trámite. */
  detail: {
    breadcrumbLabel: "Ruta de navegación",
    homeLabel: "Inicio",
    servicesLabel: "Servicios",
    audienceTitle: "¿Para quién es?",
    includesTitle: "Qué incluye nuestra asesoría",
    booking: {
      title: "¿Quieres avanzar con este trámite?",
      description:
        "Reserva una consulta con uno de nuestros profesionales. Revisaremos tu caso y te explicaremos las opciones y los siguientes pasos.",
      label: "Reservar consulta",
    },
    relatedTitle: "Otros trámites de esta categoría",
    /** Aviso al pie: los textos son informativos, no asesoría. */
    disclaimer:
      "Esta información es general y no constituye asesoría legal. Cada caso es distinto: en la consulta revisamos tu situación particular.",
  },
  /** Página que se muestra cuando la URL de un trámite no existe. */
  notFound: {
    title: "No encontramos ese trámite",
    description:
      "Es posible que el enlace haya cambiado o esté incompleto. Puedes ver todos nuestros servicios o reservar una consulta para orientarte.",
    servicesAction: {
      label: "Ver todos los servicios",
      href: "/servicios",
      icon: "arrow_forward",
    },
    bookingAction: { label: "Reservar consulta", href: "/agendar" },
  },
  whyChooseUs: {
    title: "¿Por qué elegir Help Immigration Canada?",
    description:
      "Nuestra experiencia y compromiso con la transparencia nos convierten en tu mejor aliado para migrar a Canadá.",
    items: reasons,
  },
  cta: {
    title: "¿No estás seguro de cuál es tu mejor opción?",
    description:
      "La legislación migratoria canadiense es compleja y cambia constantemente. Nuestros consultores regulados (RCIC) evaluarán tu perfil detalladamente para diseñar la estrategia con mayores probabilidades de éxito.",
    action: ctaAction,
    backgroundImage: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBk79WX2qBOcUtxV9RWaNZwExZW0_JbNMYNQR6wgnZvxjbciuTuN4NznwMG7ybltEKeZzRp7qMcw6_yuItKOAln1BPcyf2meUGkRxATuGIWPQCkMKsAXnnRx8U6joDA1e413lTH7XS3GQR07reGMAqbTp7ltVNokANRPNWCq7kPMrt_ELXAXjDUHYejeK42rnScFvxmjqKcrCAPx5-AZpluQch5f1y8T11osbqkvC6KszV_AaQMVOPn",
      alt: "",
    },
  },
} as const;
