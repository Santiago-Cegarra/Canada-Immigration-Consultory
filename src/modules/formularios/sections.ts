export const SECTION_KEYS = [
  "personal-data",
  "residence-status",
  "civil-status",
  "previous-relationships",
  "languages",
  "passport",
  "national-id",
  "us-permanent-residence",
  "address-contact",
  "education",
  "employment-activities",
  "health",
  "immigration-history",
  "criminal-history",
  "military-police-service",
  "organizations-background",
  "additional-information",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type AnswerValue = string | boolean;

export type VisibilityRule =
  | { fieldId: string; equals: AnswerValue }
  | { anyOf: readonly { fieldId: string; equals: AnswerValue }[] };

export type FieldInput =
  | "text"
  | "textarea"
  | "yes-no"
  | "number"
  | "date"
  | "month"
  | "email"
  | "phone"
  | "select";

export type QuestionDefinition = {
  kind: "question";
  id: string;
  label: string;
  input: FieldInput;
  required?: boolean;
  helpText?: string;
  options?: readonly string[];
  visibleWhen?: VisibilityRule;
};

export type RepeatableGroupDefinition = {
  kind: "repeatable";
  id: string;
  title: string;
  description?: string;
  minimumItems?: number;
  visibleWhen?: VisibilityRule;
  fields: readonly QuestionDefinition[];
};

export type SectionDefinition = {
  key: SectionKey;
  number: number;
  title: string;
  description?: string;
  minimumAge?: number;
  sensitive?: boolean;
  items: readonly (QuestionDefinition | RepeatableGroupDefinition)[];
};

type QuestionOptions = Omit<
  QuestionDefinition,
  "kind" | "id" | "label" | "input"
>;

function question(
  id: string,
  label: string,
  input: FieldInput = "text",
  options: QuestionOptions = {},
): QuestionDefinition {
  return { kind: "question", id, label, input, ...options };
}

function repeatable(
  id: string,
  title: string,
  fields: readonly QuestionDefinition[],
  options: Omit<
    RepeatableGroupDefinition,
    "kind" | "id" | "title" | "fields"
  > = {},
): RepeatableGroupDefinition {
  return { kind: "repeatable", id, title, fields, ...options };
}

const yes = (fieldId: string): VisibilityRule => ({ fieldId, equals: true });
const no = (fieldId: string): VisibilityRule => ({ fieldId, equals: false });

const IMMIGRATION_STATUS_OPTIONS = [
  "Ciudadano",
  "Residente permanente",
  "Visitante",
  "Trabajador",
  "Estudiante",
  "Persona protegida",
  "Solicitante de refugio",
  "Extranjero",
  "Otro",
] as const;

const CIVIL_STATUS_OPTIONS = [
  "Matrimonio anulado",
  "Unión de hecho",
  "Divorciado/a",
  "Separado/a legalmente",
  "Casado/a",
  "Soltero/a",
  "Viudo/a",
] as const;

const EDUCATION_LEVEL_OPTIONS = [
  "Ninguno",
  "Secundaria o menos",
  "Certificado o diploma de oficio/aprendizaje",
  "Certificado o diploma no universitario",
  "Postsecundaria sin título",
  "Licenciatura o bachelor",
  "Posgrado sin título",
  "Maestría",
  "Doctorado o PhD",
] as const;

const EYE_COLOUR_OPTIONS = [
  "Negro",
  "Azul",
  "Marrón",
  "Verde",
  "Gris",
  "Avellana",
  "Otro",
] as const;

/**
 * Banco canónico de secciones derivado de `forms.txt`.
 *
 * Los formularios no copian estas preguntas: guardan únicamente las claves de
 * las secciones que usan y su orden. Por eso los IDs de preguntas y secciones
 * son contratos persistentes; no deben renombrarse una vez haya respuestas.
 */
export const FORM_SECTIONS: readonly SectionDefinition[] = [
  {
    key: "personal-data",
    number: 1,
    title: "Datos personales",
    items: [
      question("givenNames", "Nombres", "text", { required: true }),
      question("surnames", "Apellidos", "text", { required: true }),
      question(
        "hasOtherNames",
        "¿Ha utilizado otros nombres, apellidos, nombre de casado/a, alias o apodos?",
        "yes-no",
        { required: true },
      ),
      question("otherNames", "Indique cuáles", "textarea", {
        required: true,
        visibleWhen: yes("hasOtherNames"),
      }),
      question("documentSex", "Sexo, según su documento", "select", {
        required: true,
        options: ["F", "M", "U", "X"],
        helpText: "F: femenino, M: masculino, U: desconocido, X: otro género.",
      }),
      question("heightCentimetres", "Altura en centímetros", "number"),
      question("eyeColour", "Color de ojos", "select", {
        options: EYE_COLOUR_OPTIONS,
      }),
      question("birthDate", "Fecha de nacimiento", "date", { required: true }),
      question("birthCity", "Ciudad de nacimiento", "text", { required: true }),
      question("birthCountry", "País de nacimiento", "text", {
        required: true,
      }),
      question("nationalities", "País de ciudadanía principal", "text", {
        required: true,
      }),
      question("secondCitizenship", "Segundo país de ciudadanía, si aplica"),
      question("irccUci", "UCI de IRCC, si lo conoce"),
      question("desiredProcess", "Tipo de trámite que desea realizar", "text", {
        required: true,
      }),
      question(
        "applicationProgram",
        "Programa bajo el cual presenta la solicitud",
        "select",
        {
          options: ["Familiar", "Económico", "Refugio", "Otro"],
          helpText:
            "Campo requerido por el IMM 0008 para solicitudes de residencia permanente.",
        },
      ),
      question("applicationCategory", "Categoría específica de la solicitud"),
      question(
        "totalFamilyMembers",
        "Número total de familiares incluidos en la solicitud, incluyéndose usted",
        "number",
      ),
      question(
        "correspondenceLanguage",
        "Idioma preferido para correspondencia",
        "select",
        {
          options: ["Inglés", "Francés"],
        },
      ),
      question(
        "interviewLanguage",
        "Idioma preferido para la entrevista",
        "select",
        {
          options: ["Inglés", "Francés", "Otro"],
        },
      ),
      question(
        "interpreterRequested",
        "¿Solicita intérprete para la entrevista?",
        "yes-no",
      ),
      question(
        "intendedProvince",
        "Provincia o territorio donde planea vivir en Canadá",
      ),
      question(
        "intendedCity",
        "Ciudad o localidad donde planea vivir en Canadá",
      ),
      question("plansToLiveInQuebec", "¿Planea vivir en Quebec?", "yes-no"),
      question(
        "hasCsq",
        "¿Ha recibido el Certificat de sélection du Québec (CSQ)?",
        "yes-no",
        {
          visibleWhen: yes("plansToLiveInQuebec"),
        },
      ),
      question("csqNumber", "Número del CSQ", "text", {
        visibleWhen: yes("hasCsq"),
      }),
      question("csqAppliedAt", "Fecha en que solicitó el CSQ", "date", {
        visibleWhen: no("hasCsq"),
      }),
      question("applicantRole", "Indique su rol en esta solicitud", "select", {
        options: [
          "Solicitante principal",
          "Cónyuge, pareja de hecho o hijo/a mayor de edad del solicitante principal",
        ],
      }),
      question(
        "appliesToExtendStatus",
        "¿Solicita extender su estatus en Canadá?",
        "yes-no",
      ),
      question(
        "appliesToRestoreStatus",
        "¿Solicita restaurar su estatus en Canadá?",
        "yes-no",
      ),
      question(
        "appliesForNewTemporaryResidentPermit",
        "¿Solicita un nuevo permiso de residencia temporal (por inadmisibilidad)?",
        "yes-no",
      ),
      question(
        "intendedStayDuration",
        "Duración prevista de su estadía en Canadá",
        "select",
        {
          options: ["Menos de 6 meses", "Más de 6 meses", "Permanentemente"],
        },
      ),
      question("visitPurpose", "Propósito de su visita a Canadá", "select", {
        options: [
          "Turismo",
          "Negocios",
          "Visita familiar",
          "Visita",
          "Super Visa",
          "Estudios cortos",
          "Estudio",
          "Trabajo",
          "Estudiante que regresa",
          "Trabajador que regresa",
          "Otro",
        ],
      }),
      question(
        "visitFrom",
        "Fecha desde la que planea estar en Canadá",
        "date",
      ),
      question("visitTo", "Fecha hasta la que planea estar en Canadá", "date"),
      question(
        "stayFundsCad",
        "Fondos disponibles para su estadía en Canadá, en dólares canadienses",
        "number",
      ),
      question("expensesPaidBy", "¿Quién cubrirá sus gastos en Canadá?"),
      repeatable(
        "visitContacts",
        "Personas o instituciones que visitará en Canadá",
        [
          question("name", "Nombre de la persona o institución", "text", {
            required: true,
          }),
          question("relationship", "Relación con usted"),
          question("address", "Dirección en Canadá"),
        ],
      ),
      question(
        "hasFamilyInCanada",
        "¿Tiene algún familiar (cónyuge, pareja o hijo/a) que sea ciudadano o residente permanente de Canadá?",
        "yes-no",
      ),
      question(
        "hasDependants",
        "¿Incluye dependientes en esta solicitud?",
        "yes-no",
      ),
      repeatable(
        "dependants",
        "Dependientes incluidos en la solicitud",
        [
          question("familyNames", "Apellidos", "text", { required: true }),
          question("givenNames", "Nombres", "text", { required: true }),
          question(
            "hasOtherNames",
            "¿Ha utilizado otros nombres o alias?",
            "yes-no",
            {
              required: true,
            },
          ),
          question("otherFamilyNames", "Otros apellidos utilizados", "text", {
            required: true,
            visibleWhen: yes("hasOtherNames"),
          }),
          question("otherGivenNames", "Otros nombres utilizados", "text", {
            required: true,
            visibleWhen: yes("hasOtherNames"),
          }),
          question("uci", "UCI de IRCC, si lo conoce"),
          question("sex", "Sexo", "select", {
            required: true,
            options: ["F", "M", "U", "X"],
          }),
          question("heightCentimetres", "Altura en centímetros", "number"),
          question("eyeColour", "Color de ojos", "select", {
            options: EYE_COLOUR_OPTIONS,
          }),
          question("birthDate", "Fecha de nacimiento", "date", {
            required: true,
          }),
          question("birthCity", "Ciudad o localidad de nacimiento", "text", {
            required: true,
          }),
          question("birthCountry", "País de nacimiento", "text", {
            required: true,
          }),
          question(
            "primaryCitizenship",
            "País de ciudadanía principal",
            "text",
            {
              required: true,
            },
          ),
          question(
            "secondCitizenship",
            "Segundo país de ciudadanía, si aplica",
          ),
          question(
            "relationship",
            "Relación con el solicitante principal",
            "select",
            {
              required: true,
              options: [
                "Hijo/a adoptivo/a",
                "Padre o madre adoptivo/a",
                "Hijo/a",
                "Pareja de hecho",
                "Nieto/a",
                "Padre o madre",
                "Esposo/a",
                "Hijastro/a",
                "Nietastro/a",
                "Otro",
              ],
            },
          ),
          question("relationshipOther", "Especifique la relación", "text", {
            required: true,
            visibleWhen: { fieldId: "relationship", equals: "Otro" },
          }),
          question(
            "accompaniesToCanada",
            "¿Acompañará al solicitante a Canadá?",
            "yes-no",
            {
              required: true,
            },
          ),
          question(
            "nonAccompanyingReason",
            "Explique por qué no acompañará al solicitante",
            "textarea",
            {
              required: true,
              visibleWhen: no("accompaniesToCanada"),
            },
          ),
          question(
            "dependantType",
            "Tipo de dependiente, si corresponde",
            "select",
            {
              options: ["Tipo A", "Tipo B", "Tipo C", "No aplica"],
            },
          ),
          question(
            "currentResidenceCountry",
            "País de residencia actual",
            "text",
            {
              required: true,
            },
          ),
          question(
            "currentResidenceStatus",
            "Estatus migratorio actual",
            "select",
            {
              required: true,
              options: IMMIGRATION_STATUS_OPTIONS,
            },
          ),
          question(
            "currentResidenceStatusOther",
            "Explique el estatus ‘Otro’",
            "text",
            {
              required: true,
              visibleWhen: {
                fieldId: "currentResidenceStatus",
                equals: "Otro",
              },
            },
          ),
          question("currentResidenceFrom", "Residencia actual desde", "date", {
            required: true,
          }),
          question(
            "currentResidenceTo",
            "Residencia actual hasta, si corresponde",
            "date",
          ),
          question(
            "lastCanadaEntryDate",
            "Fecha de la última entrada a Canadá, si aplica",
            "date",
          ),
          question(
            "lastCanadaEntryPlace",
            "Lugar de la última entrada a Canadá, si aplica",
          ),
          question(
            "livedInOtherCountry",
            "En los últimos 5 años, ¿vivió más de 6 meses en otro país?",
            "yes-no",
            { required: true },
          ),
          question(
            "previousResidenceDetails",
            "Por cada residencia anterior indique país, estatus, explicación de ‘Otro’ y fechas desde/hasta",
            "textarea",
            { required: true, visibleWhen: yes("livedInOtherCountry") },
          ),
          question("civilStatus", "Estado civil actual", "select", {
            required: true,
            options: CIVIL_STATUS_OPTIONS,
          }),
          question(
            "currentRelationshipDate",
            "Fecha de matrimonio o inicio de unión de hecho",
            "date",
            {
              visibleWhen: {
                anyOf: [
                  { fieldId: "civilStatus", equals: "Casado/a" },
                  { fieldId: "civilStatus", equals: "Unión de hecho" },
                ],
              },
            },
          ),
          question(
            "currentPartnerFamilyNames",
            "Apellidos de la pareja actual",
            "text",
            {
              visibleWhen: {
                anyOf: [
                  { fieldId: "civilStatus", equals: "Casado/a" },
                  { fieldId: "civilStatus", equals: "Unión de hecho" },
                ],
              },
            },
          ),
          question(
            "currentPartnerGivenNames",
            "Nombres de la pareja actual",
            "text",
            {
              visibleWhen: {
                anyOf: [
                  { fieldId: "civilStatus", equals: "Casado/a" },
                  { fieldId: "civilStatus", equals: "Unión de hecho" },
                ],
              },
            },
          ),
          question(
            "hadPreviousRelationship",
            "¿Estuvo casado/a o en unión de hecho anteriormente?",
            "yes-no",
            {
              required: true,
            },
          ),
          question(
            "previousRelationshipDetails",
            "Indique apellidos, nombres, fecha de nacimiento, tipo de relación y fechas desde/hasta",
            "textarea",
            { required: true, visibleWhen: yes("hadPreviousRelationship") },
          ),
          question(
            "hasValidPassport",
            "¿Tiene pasaporte o documento de viaje válido?",
            "yes-no",
            {
              required: true,
            },
          ),
          question(
            "passportNumber",
            "Número de pasaporte o documento de viaje",
            "text",
            {
              required: true,
              visibleWhen: yes("hasValidPassport"),
            },
          ),
          question("passportCountry", "País emisor del pasaporte", "text", {
            required: true,
            visibleWhen: yes("hasValidPassport"),
          }),
          question(
            "passportIssuedAt",
            "Fecha de emisión del pasaporte",
            "date",
            {
              required: true,
              visibleWhen: yes("hasValidPassport"),
            },
          ),
          question(
            "passportExpiresAt",
            "Fecha de vencimiento del pasaporte",
            "date",
            {
              required: true,
              visibleWhen: yes("hasValidPassport"),
            },
          ),
          question(
            "taiwanPassportWithPersonalId",
            "¿Usará un pasaporte de Taiwán que muestra su identificación personal?",
            "yes-no",
            {
              visibleWhen: yes("hasValidPassport"),
            },
          ),
          question(
            "israeliNationalPassport",
            "¿Usará un pasaporte nacional israelí?",
            "yes-no",
            {
              visibleWhen: yes("hasValidPassport"),
            },
          ),
          question(
            "hasValidNationalId",
            "¿Tiene un documento nacional de identidad válido?",
            "yes-no",
            {
              required: true,
            },
          ),
          question(
            "nationalIdNumber",
            "Número del documento nacional",
            "text",
            {
              required: true,
              visibleWhen: yes("hasValidNationalId"),
            },
          ),
          question(
            "nationalIdCountry",
            "País emisor del documento nacional",
            "text",
            {
              required: true,
              visibleWhen: yes("hasValidNationalId"),
            },
          ),
          question(
            "nationalIdIssuedAt",
            "Fecha de emisión del documento nacional",
            "date",
            {
              required: true,
              visibleWhen: yes("hasValidNationalId"),
            },
          ),
          question(
            "nationalIdExpiresAt",
            "Fecha de vencimiento del documento nacional",
            "date",
            {
              visibleWhen: yes("hasValidNationalId"),
            },
          ),
          question(
            "highestEducationLevel",
            "Nivel de educación más alto",
            "select",
            {
              options: EDUCATION_LEVEL_OPTIONS,
            },
          ),
          question(
            "formalEducationYears",
            "Años totales de educación formal",
            "number",
          ),
          question("currentOccupation", "Ocupación actual"),
          question("intendedOccupation", "Ocupación prevista en Canadá"),
          question("nativeLanguage", "Idioma materno"),
          question(
            "officialLanguages",
            "¿Puede comunicarse en inglés, francés, ambos o ninguno?",
            "select",
            {
              options: ["Inglés", "Francés", "Ambos", "Ninguno"],
            },
          ),
          question(
            "preferredOfficialLanguage",
            "Idioma en el que se siente más cómodo/a",
            "select",
            {
              options: ["Inglés", "Francés"],
              visibleWhen: { fieldId: "officialLanguages", equals: "Ambos" },
            },
          ),
          question(
            "hasLanguageTest",
            "¿Presentó un examen de idioma ante una entidad designada?",
            "yes-no",
          ),
        ],
        {
          description:
            "El IMM 0008 admite hasta 5 dependientes; declare también quienes no acompañarán al solicitante. Para más de 5, IRCC exige el IMM 0008DEP.",
          minimumItems: 1,
          visibleWhen: yes("hasDependants"),
        },
      ),
    ],
  },
  {
    key: "residence-status",
    number: 2,
    title: "Residencia y estatus migratorio",
    items: [
      question(
        "currentResidenceCountry",
        "País donde vive actualmente",
        "text",
        { required: true },
      ),
      question("currentStatus", "Estatus en ese país", "select", {
        required: true,
        options: IMMIGRATION_STATUS_OPTIONS,
      }),
      question(
        "currentStatusOther",
        "Si su estatus es “otro”, explique",
        "text",
        {
          required: true,
          visibleWhen: { fieldId: "currentStatus", equals: "Otro" },
        },
      ),
      question(
        "currentStatusFrom",
        "Fecha desde la que tiene ese estatus",
        "date",
        { required: true },
      ),
      question(
        "currentStatusExpiry",
        "Fecha de vencimiento, si corresponde",
        "date",
      ),
      question(
        "currentResidenceTo",
        "Fecha hasta la que reside o residió en este país, si corresponde",
        "date",
      ),
      question(
        "lastCanadaEntryDate",
        "Fecha de su última entrada a Canadá, si aplica",
        "date",
      ),
      question(
        "lastCanadaEntryPlace",
        "Lugar de su última entrada a Canadá, si aplica",
      ),
      question(
        "livedInOtherCountry",
        "Durante los últimos 5 años, ¿vivió por más de 6 meses en un país distinto de su país de nacionalidad y residencia actual?",
        "yes-no",
        { required: true },
      ),
      repeatable(
        "previousCountries",
        "Países de residencia anteriores",
        [
          question("country", "País", "text", { required: true }),
          question("status", "Estatus migratorio", "select", {
            required: true,
            options: IMMIGRATION_STATUS_OPTIONS,
          }),
          question("statusOther", "Explique el estatus ‘Otro’", "text", {
            required: true,
            visibleWhen: { fieldId: "status", equals: "Otro" },
          }),
          question("from", "Desde", "date", { required: true }),
          question("to", "Hasta", "date", { required: true }),
        ],
        { visibleWhen: yes("livedInOtherCountry"), minimumItems: 1 },
      ),
      question(
        "applyingFromCurrentCountry",
        "¿Presentará la solicitud desde su país de residencia actual?",
        "yes-no",
        { required: true },
      ),
      question("applicationCountry", "País desde donde aplicará", "text", {
        required: true,
        visibleWhen: no("applyingFromCurrentCountry"),
      }),
      question("applicationCountryStatus", "Estatus en ese país", "text", {
        required: true,
        visibleWhen: no("applyingFromCurrentCountry"),
      }),
      question("applicationCountryFrom", "Desde", "date", {
        required: true,
        visibleWhen: no("applyingFromCurrentCountry"),
      }),
      question("applicationCountryTo", "Hasta", "date", {
        required: true,
        visibleWhen: no("applyingFromCurrentCountry"),
      }),
      question(
        "hasTravelHistory",
        "Desde los 18 años o durante los últimos 5 años (lo que sea más reciente), ¿ha viajado a algún país o territorio distinto de su país de nacionalidad o de residencia actual?",
        "yes-no",
        { required: true },
      ),
      repeatable(
        "trips",
        "Viajes anteriores",
        [
          question("from", "Desde", "date", { required: true }),
          question("to", "Hasta", "date", { required: true }),
          question("destination", "País y lugar visitado", "text", {
            required: true,
          }),
          question("purpose", "Motivo del viaje", "text", { required: true }),
        ],
        { visibleWhen: yes("hasTravelHistory"), minimumItems: 1 },
      ),
      question(
        "currentlyInCanada",
        "¿Se encuentra actualmente en Canadá?",
        "yes-no",
      ),
      question(
        "firstCanadaEntryDate",
        "Fecha de su primera entrada a Canadá",
        "date",
      ),
      question("firstCanadaEntryPlace", "Lugar de su primera entrada a Canadá"),
      question(
        "originalEntryPurpose",
        "Propósito inicial de su entrada a Canadá",
        "select",
        {
          options: [
            "Negocios",
            "Turismo",
            "Estudio",
            "Trabajo",
            "Visita familiar",
            "Otro",
          ],
        },
      ),
      question(
        "latestPermitNumber",
        "Número de su visa, permiso de trabajo, permiso de estudio o permiso de residencia temporal más reciente, si aplica",
      ),
    ],
  },
  {
    key: "civil-status",
    number: 3,
    title: "Estado civil y pareja actual",
    items: [
      question("civilStatus", "Estado civil actual", "select", {
        required: true,
        options: CIVIL_STATUS_OPTIONS,
      }),
      question("marriageDate", "Fecha de matrimonio, si corresponde", "date"),
      question(
        "commonLawSince",
        "Si convive en unión de hecho, indique desde cuándo viven juntos de manera continua",
        "date",
      ),
      question("partnerGivenNames", "Nombres de su esposo/a o pareja"),
      question("partnerSurnames", "Apellidos de su esposo/a o pareja"),
      question(
        "partnerIsCanadianCitizenOrPr",
        "¿Su esposo/a o pareja es ciudadano/a o residente permanente de Canadá?",
        "yes-no",
      ),
    ],
  },
  {
    key: "previous-relationships",
    number: 4,
    title: "Matrimonios o uniones anteriores",
    items: [
      question(
        "hadPreviousRelationship",
        "¿Estuvo casado/a o en unión de hecho anteriormente?",
        "yes-no",
        { required: true },
      ),
      repeatable(
        "previousRelationships",
        "Relaciones anteriores",
        [
          question(
            "formerPartnerName",
            "Nombres y apellidos de la expareja",
            "text",
            { required: true },
          ),
          question("birthDate", "Fecha de nacimiento", "date", {
            required: true,
          }),
          question("relationshipType", "Tipo de relación", "select", {
            required: true,
            options: ["Matrimonio", "Unión de hecho"],
          }),
          question("startDate", "Fecha de inicio", "date", { required: true }),
          question("endDate", "Fecha de finalización", "date", {
            required: true,
          }),
        ],
        { visibleWhen: yes("hadPreviousRelationship"), minimumItems: 1 },
      ),
    ],
  },
  {
    key: "languages",
    number: 5,
    title: "Idiomas",
    items: [
      question("nativeLanguage", "Idioma materno", "text", { required: true }),
      question(
        "officialLanguages",
        "¿Puede comunicarse en inglés, francés, ambos o ninguno?",
        "select",
        { required: true, options: ["Inglés", "Francés", "Ambos", "Ninguno"] },
      ),
      question(
        "preferredOfficialLanguage",
        "¿En cuál de esos idiomas se siente más cómodo/a?",
        "select",
        {
          required: true,
          options: ["Inglés", "Francés"],
          visibleWhen: { fieldId: "officialLanguages", equals: "Ambos" },
        },
      ),
      question(
        "hasLanguageTest",
        "¿Ha presentado un examen de inglés o francés ante una entidad designada?",
        "yes-no",
        { required: true },
      ),
      question("languageTestDetails", "Nombre del examen y fecha", "textarea", {
        required: true,
        visibleWhen: yes("hasLanguageTest"),
      }),
    ],
  },
  {
    key: "passport",
    number: 6,
    title: "Pasaporte o documento de viaje",
    items: [
      question(
        "hasValidPassport",
        "¿Tiene un pasaporte o documento de viaje válido?",
        "yes-no",
        { required: true },
      ),
      question("passportNumber", "Número", "text", {
        required: true,
        visibleWhen: yes("hasValidPassport"),
      }),
      question("passportCountry", "País emisor", "text", {
        required: true,
        visibleWhen: yes("hasValidPassport"),
      }),
      question("passportIssuedAt", "Fecha de emisión", "date", {
        required: true,
        visibleWhen: yes("hasValidPassport"),
      }),
      question("passportExpiresAt", "Fecha de vencimiento", "date", {
        required: true,
        visibleWhen: yes("hasValidPassport"),
      }),
      question(
        "taiwanPassportWithPersonalId",
        "¿Utilizará un pasaporte emitido por el Ministerio de Relaciones Exteriores de Taiwán que incluya su número de identificación personal?",
        "yes-no",
        { required: true, visibleWhen: yes("hasValidPassport") },
      ),
      question(
        "israeliNationalPassport",
        "¿Utilizará un pasaporte nacional israelí?",
        "yes-no",
        { required: true, visibleWhen: yes("hasValidPassport") },
      ),
    ],
  },
  {
    key: "national-id",
    number: 7,
    title: "Documento nacional de identidad",
    items: [
      question(
        "hasNationalId",
        "¿Tiene una cédula o documento nacional de identidad válido?",
        "yes-no",
        { required: true },
      ),
      question("nationalIdNumber", "Número", "text", {
        required: true,
        visibleWhen: yes("hasNationalId"),
      }),
      question("nationalIdCountry", "País emisor", "text", {
        required: true,
        visibleWhen: yes("hasNationalId"),
      }),
      question("nationalIdIssuedAt", "Fecha de emisión", "date", {
        required: true,
        visibleWhen: yes("hasNationalId"),
      }),
      question(
        "nationalIdExpiresAt",
        "Fecha de vencimiento, o indique si no vence",
        "text",
        { required: true, visibleWhen: yes("hasNationalId") },
      ),
    ],
  },
  {
    key: "us-permanent-residence",
    number: 8,
    title: "Residencia permanente en Estados Unidos",
    items: [
      question(
        "hasValidGreenCard",
        "¿Es residente permanente legal de Estados Unidos y tiene una Green Card vigente?",
        "yes-no",
        { required: true },
      ),
      question("greenCardNumber", "Número del documento", "text", {
        required: true,
        visibleWhen: yes("hasValidGreenCard"),
      }),
      question("greenCardExpiresAt", "Fecha de vencimiento", "date", {
        required: true,
        visibleWhen: yes("hasValidGreenCard"),
      }),
    ],
  },
  {
    key: "address-contact",
    number: 9,
    title: "Dirección y contacto",
    items: [
      question("homeUnit", "Apartamento o unidad"),
      question("homeStreetNumber", "Número del inmueble", "text", {
        required: true,
      }),
      question("homeStreet", "Calle", "text", { required: true }),
      question("homeCity", "Ciudad", "text", { required: true }),
      question("homeRegion", "Provincia o estado", "text", { required: true }),
      question("homeCountry", "País", "text", { required: true }),
      question("homePostalCode", "Código postal", "text", { required: true }),
      question("homeDistrict", "Distrito, si corresponde"),
      question(
        "homeAddressSince",
        "Fecha desde la que vive en esta dirección",
        "date",
      ),
      question(
        "sameMailingAddress",
        "¿Su dirección para recibir correspondencia es la misma?",
        "yes-no",
        { required: true },
      ),
      question(
        "mailingAddress",
        "Dirección postal completa (referencia)",
        "textarea",
        { visibleWhen: no("sameMailingAddress") },
      ),
      question("mailingPoBox", "Apartado postal, si corresponde", "text", {
        visibleWhen: no("sameMailingAddress"),
      }),
      question("mailingUnit", "Apartamento o unidad postal", "text", {
        visibleWhen: no("sameMailingAddress"),
      }),
      question("mailingStreetNumber", "Número del inmueble postal", "text", {
        visibleWhen: no("sameMailingAddress"),
      }),
      question("mailingStreet", "Calle de la dirección postal", "text", {
        visibleWhen: no("sameMailingAddress"),
      }),
      question("mailingCity", "Ciudad de la dirección postal", "text", {
        required: true,
        visibleWhen: no("sameMailingAddress"),
      }),
      question(
        "mailingRegion",
        "Provincia o estado de la dirección postal",
        "text",
        {
          visibleWhen: no("sameMailingAddress"),
        },
      ),
      question("mailingCountry", "País de la dirección postal", "text", {
        required: true,
        visibleWhen: no("sameMailingAddress"),
      }),
      question(
        "mailingPostalCode",
        "Código postal de la dirección postal",
        "text",
        {
          visibleWhen: no("sameMailingAddress"),
        },
      ),
      question(
        "mailingDistrict",
        "Distrito de la dirección postal, si corresponde",
        "text",
        {
          visibleWhen: no("sameMailingAddress"),
        },
      ),
      question(
        "primaryPhone",
        "Teléfono principal con código de país",
        "phone",
        { required: true },
      ),
      question("primaryPhoneType", "Tipo", "select", {
        required: true,
        options: ["Celular", "Casa", "Trabajo"],
      }),
      question(
        "primaryPhoneLocation",
        "Ubicación del teléfono principal",
        "select",
        {
          required: true,
          options: ["Canadá o Estados Unidos", "Otro país"],
        },
      ),
      question("primaryPhoneExtension", "Extensión, si corresponde"),
      question(
        "alternatePhone",
        "Teléfono alternativo con código de país",
        "phone",
      ),
      question(
        "alternatePhoneTypeAndExtension",
        "Información adicional del teléfono alternativo, si corresponde",
      ),
      question("alternatePhoneType", "Tipo de teléfono alternativo", "select", {
        options: ["Celular", "Casa", "Trabajo"],
      }),
      question(
        "alternatePhoneLocation",
        "Ubicación del teléfono alternativo",
        "select",
        {
          options: ["Canadá o Estados Unidos", "Otro país"],
        },
      ),
      question("alternatePhoneExtension", "Extensión del teléfono alternativo"),
      question("fax", "Fax, si tiene", "phone"),
      question("faxLocation", "Ubicación del fax", "select", {
        options: ["Canadá o Estados Unidos", "Otro país"],
      }),
      question("email", "Correo electrónico", "email", { required: true }),
    ],
  },
  {
    key: "education",
    number: 10,
    title: "Educación",
    items: [
      question(
        "highestEducationLevel",
        "Nivel de educación más alto",
        "select",
        {
          required: true,
          options: EDUCATION_LEVEL_OPTIONS,
        },
      ),
      question(
        "formalEducationYears",
        "Número total de años de educación formal, incluyendo primaria y secundaria",
        "number",
        { required: true },
      ),
      question("currentOccupation", "Ocupación actual", "text", {
        required: true,
        helpText: "Si no trabaja actualmente, indique “Sin empleo”.",
      }),
      question("intendedOccupation", "Ocupación prevista en Canadá", "text", {
        required: true,
        helpText: "Si no planea trabajar en Canadá, indique “Ninguna”.",
      }),
      question(
        "hasPostSecondaryEducation",
        "¿Ha cursado estudios posteriores a la secundaria, incluyendo universidad, college o formación de oficios?",
        "yes-no",
        { required: true },
      ),
      question("highestProgram", "Programa o área de estudio", "text", {
        required: true,
        visibleWhen: yes("hasPostSecondaryEducation"),
      }),
      question("highestInstitution", "Nombre de la institución", "text", {
        required: true,
        visibleWhen: yes("hasPostSecondaryEducation"),
      }),
      question("highestStudyFrom", "Fecha de inicio", "month", {
        required: true,
        visibleWhen: yes("hasPostSecondaryEducation"),
      }),
      question(
        "highestStudyTo",
        "Fecha de finalización o indique “En curso”",
        "text",
        {
          required: true,
          visibleWhen: yes("hasPostSecondaryEducation"),
        },
      ),
      question("highestStudyCity", "Ciudad", "text", {
        required: true,
        visibleWhen: yes("hasPostSecondaryEducation"),
      }),
      question("highestStudyRegion", "Provincia o estado", "text", {
        required: true,
        visibleWhen: yes("hasPostSecondaryEducation"),
      }),
      question("highestStudyCountry", "País", "text", {
        required: true,
        visibleWhen: yes("hasPostSecondaryEducation"),
      }),
      repeatable(
        "additionalStudies",
        "Otros estudios postsecundarios",
        [
          question("from", "Fecha de inicio", "month", { required: true }),
          question("to", "Fecha de finalización o indique “En curso”", "text", {
            required: true,
          }),
          question("program", "Programa o área de estudio", "text", {
            required: true,
          }),
          question("institution", "Nombre de la institución", "text", {
            required: true,
          }),
          question("city", "Ciudad", "text", { required: true }),
          question("region", "Provincia o estado", "text", { required: true }),
          question("country", "País", "text", { required: true }),
        ],
        { visibleWhen: yes("hasPostSecondaryEducation") },
      ),
      question(
        "plannedSchoolName",
        "Nombre de la institución donde estudiará en Canadá",
      ),
      question("plannedStudyLevel", "Nivel de estudios que cursará"),
      question("plannedStudyField", "Programa o área de estudio que cursará"),
      question("plannedSchoolAddress", "Dirección de la institución"),
      question(
        "plannedSchoolProvince",
        "Provincia o territorio de la institución",
      ),
      question("plannedSchoolCity", "Ciudad de la institución"),
      question(
        "dliNumber",
        "Número de institución de enseñanza designada (DLI)",
      ),
      question("studentNumber", "Número de estudiante"),
      question("plannedStudyFrom", "Fecha de inicio de clases", "date"),
      question("plannedStudyTo", "Fecha de fin de clases", "date"),
      question(
        "tuitionCost",
        "Costo del curso o programa, en dólares canadienses",
        "number",
      ),
      question(
        "roomAndBoardCost",
        "Costo de alojamiento y alimentación, si aplica, en dólares canadienses",
        "number",
      ),
      question("otherCosts", "Otros costos, en dólares canadienses", "number"),
    ],
  },
  {
    key: "employment-activities",
    number: 11,
    title: "Empleos y actividades",
    description:
      "Últimos 10 años, comenzando por la actividad actual y sin períodos sin explicar. Incluye estudios, desempleo, trabajo independiente, labores del hogar y cargos públicos.",
    items: [
      repeatable(
        "activities",
        "Empleo o actividad",
        [
          question("from", "Desde — año y mes", "month", { required: true }),
          question("to", "Hasta — año y mes, o “Actualidad”", "text", {
            required: true,
          }),
          question("position", "Cargo, ocupación o actividad", "text", {
            required: true,
          }),
          question("organization", "Empresa, empleador o institución", "text", {
            required: true,
          }),
          question("city", "Ciudad", "text", { required: true }),
          question("region", "Provincia o estado", "text", { required: true }),
          question("country", "País", "text", { required: true }),
        ],
        { minimumItems: 1 },
      ),
      question(
        "workPermitType",
        "Tipo de permiso de trabajo que solicita",
        "select",
        {
          options: [
            "LMIA (Evaluación de Impacto en el Mercado Laboral)",
            "Exención de LMIA",
            "Permiso de trabajo abierto",
            "Permiso de trabajo posgraduación (PGWP)",
            "Otro",
          ],
        },
      ),
      question("plannedEmployerName", "Nombre del empleador en Canadá"),
      question("plannedEmployerAddress", "Dirección del empleador"),
      question(
        "plannedWorkLocation",
        "Dirección del lugar donde trabajará en Canadá",
      ),
      question("plannedWorkProvince", "Provincia o territorio donde trabajará"),
      question("plannedWorkCity", "Ciudad donde trabajará"),
      question(
        "plannedJobDuties",
        "Describa brevemente las funciones del puesto",
        "textarea",
      ),
      question(
        "plannedWorkFrom",
        "Fecha prevista de inicio del empleo",
        "date",
      ),
      question(
        "plannedWorkTo",
        "Fecha prevista de finalización del empleo",
        "date",
      ),
      question(
        "lmiaOrOfferNumber",
        "Número de LMIA o de la oferta de empleo (exenta de LMIA)",
      ),
    ],
  },
  {
    key: "health",
    number: 12,
    title: "Salud",
    minimumAge: 18,
    sensitive: true,
    items: [
      question(
        "tuberculosis",
        "En los últimos 2 años, ¿usted o algún familiar ha tenido tuberculosis pulmonar o contacto cercano con una persona con tuberculosis?",
        "yes-no",
        { required: true },
      ),
      question(
        "needsHealthServices",
        "¿Tiene alguna condición física o mental que requiera servicios sociales o de salud, aparte de medicamentos, durante su estancia en Canadá?",
        "yes-no",
        { required: true },
      ),
      question(
        "healthDetails",
        "Explique e identifique al familiar involucrado, cuando corresponda",
        "textarea",
        {
          required: true,
          visibleWhen: {
            anyOf: [
              { fieldId: "tuberculosis", equals: true },
              { fieldId: "needsHealthServices", equals: true },
            ],
          },
        },
      ),
      question(
        "medicalExamLast12Months",
        "En los últimos 12 meses, ¿se ha realizado un examen médico con un médico autorizado por IRCC (panel physician)?",
        "yes-no",
        { required: true },
      ),
    ],
  },
  {
    key: "immigration-history",
    number: 13,
    title: "Historial migratorio",
    minimumAge: 18,
    sensitive: true,
    items: [
      question(
        "canadaOverstay",
        "¿Alguna vez permaneció en Canadá después del vencimiento de su estatus?",
        "yes-no",
        { required: true },
      ),
      question(
        "unauthorizedStudy",
        "¿Alguna vez estudió en Canadá sin autorización?",
        "yes-no",
        { required: true },
      ),
      question(
        "unauthorizedWork",
        "¿Alguna vez trabajó en Canadá sin autorización?",
        "yes-no",
        { required: true },
      ),
      question(
        "visaRefusal",
        "¿Alguna vez le negaron una visa o permiso de Canadá o de cualquier otro país?",
        "yes-no",
        { required: true },
      ),
      question(
        "entryRefusalOrRemoval",
        "¿Alguna vez le negaron la entrada o le ordenaron salir de Canadá o de cualquier otro país?",
        "yes-no",
        { required: true },
      ),
      question(
        "previousCanadaApplication",
        "¿Ha solicitado anteriormente entrar o permanecer en Canadá, incluyendo eTA, visa o permiso?",
        "yes-no",
        { required: true },
      ),
      repeatable(
        "immigrationIncidents",
        "Respuestas afirmativas del historial migratorio",
        [
          question("country", "País", "text", { required: true }),
          question("date", "Fecha", "date", { required: true }),
          question("situation", "Tipo de solicitud o situación", "text", {
            required: true,
          }),
          question("result", "Resultado y motivo, si lo conoce", "textarea"),
          question("applicationNumber", "Número de solicitud, si lo tiene"),
          question("explanation", "Explicación", "textarea", {
            required: true,
          }),
        ],
        {
          minimumItems: 1,
          visibleWhen: {
            anyOf: [
              { fieldId: "canadaOverstay", equals: true },
              { fieldId: "unauthorizedStudy", equals: true },
              { fieldId: "unauthorizedWork", equals: true },
              { fieldId: "visaRefusal", equals: true },
              { fieldId: "entryRefusalOrRemoval", equals: true },
              { fieldId: "previousCanadaApplication", equals: true },
            ],
          },
        },
      ),
    ],
  },
  {
    key: "criminal-history",
    number: 14,
    title: "Antecedentes penales",
    minimumAge: 18,
    sensitive: true,
    items: [
      question(
        "hasCriminalHistory",
        "¿Alguna vez cometió un delito, fue arrestado/a, acusado/a o condenado/a por un delito en cualquier país?",
        "yes-no",
        { required: true },
      ),
      question(
        "criminalHistoryDetails",
        "Indique país, fechas, hechos y resultado o estado actual del procedimiento",
        "textarea",
        { required: true, visibleWhen: yes("hasCriminalHistory") },
      ),
    ],
  },
  {
    key: "military-police-service",
    number: 15,
    title: "Servicio militar, policial o de seguridad",
    minimumAge: 18,
    sensitive: true,
    items: [
      question(
        "hasMilitaryPoliceService",
        "¿Ha servido en fuerzas militares, milicias, defensa civil, organizaciones de seguridad o policía, incluyendo reservas o voluntariado?",
        "yes-no",
        { required: true },
      ),
      question(
        "militaryPoliceDetails",
        "Indique organización, país, funciones y fechas de servicio",
        "textarea",
        { required: true, visibleWhen: yes("hasMilitaryPoliceService") },
      ),
    ],
  },
  {
    key: "organizations-background",
    number: 16,
    title: "Organizaciones y otros antecedentes",
    minimumAge: 18,
    sensitive: true,
    items: [
      question(
        "violentOrganizationAssociation",
        "¿Es o ha sido miembro o asociado/a de un partido, grupo u organización vinculada con violencia política, religiosa o actividades delictivas?",
        "yes-no",
        { required: true },
      ),
      question(
        "witnessedOrParticipatedInAbuse",
        "¿Alguna vez presenció o participó en maltrato de prisioneros o civiles, saqueos o profanación de edificios religiosos?",
        "yes-no",
        { required: true },
      ),
      question(
        "organizationsBackgroundDetails",
        "Explique cualquier respuesta afirmativa",
        "textarea",
        {
          required: true,
          visibleWhen: {
            anyOf: [
              { fieldId: "violentOrganizationAssociation", equals: true },
              { fieldId: "witnessedOrParticipatedInAbuse", equals: true },
            ],
          },
        },
      ),
      question(
        "heldGovernmentPosition",
        "¿Ha ocupado algún cargo público o gubernamental (por ejemplo: juez, policía, alcalde, parlamentario o administrador de hospital)?",
        "yes-no",
        { required: true },
      ),
      question(
        "governmentPositionDetails",
        "Indique cargo y funciones, nivel de jurisdicción, departamento, país y fechas",
        "textarea",
        { required: true, visibleWhen: yes("heldGovernmentPosition") },
      ),
    ],
  },
  {
    key: "additional-information",
    number: 17,
    title: "Información adicional",
    items: [
      question(
        "shareEmploymentInformation",
        "¿Autoriza que la información sobre su ocupación, educación y experiencia laboral pueda compartirse con posibles empleadores para ayudarles a contratar trabajadores?",
        "yes-no",
      ),
      question(
        "applicantDeclarationName",
        "Nombre completo del solicitante para la declaración del IMM 0008",
        "text",
        {
          helpText:
            "Escribir el nombre aquí recopila la respuesta; no sustituye la firma requerida por IRCC.",
        },
      ),
      question(
        "applicantDeclarationDate",
        "Fecha de la declaración del solicitante",
        "date",
      ),
      question(
        "additionalCircumstances",
        "¿Hay algún dato, cambio o circunstancia que debamos conocer para preparar su solicitud?",
        "textarea",
      ),
      question(
        "completedBy",
        "Nombre de quien completó el cuestionario",
        "text",
        { required: true },
      ),
      question("completedAt", "Fecha", "date", { required: true }),
      question("referralSource", "¿Cómo se enteró de nosotros?", "select", {
        options: [
          "Facebook",
          "Instagram",
          "Google o sitio web",
          "Un amigo o conocido",
          "Otro",
        ],
      }),
      question("referralSourceOther", "Indique cómo se enteró", "text", {
        visibleWhen: { fieldId: "referralSource", equals: "Otro" },
      }),
    ],
  },
] satisfies readonly SectionDefinition[];

export const FORM_SECTION_BY_KEY = new Map(
  FORM_SECTIONS.map((section) => [section.key, section]),
);

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

export function countSectionQuestions(section: SectionDefinition): number {
  return section.items.reduce(
    (total, item) =>
      total + (item.kind === "repeatable" ? item.fields.length : 1),
    0,
  );
}
