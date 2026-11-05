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
      question("documentSex", "Sexo, según su documento", "text", {
        required: true,
      }),
      question("birthDate", "Fecha de nacimiento", "date", { required: true }),
      question("birthCity", "Ciudad de nacimiento", "text", { required: true }),
      question("birthCountry", "País de nacimiento", "text", {
        required: true,
      }),
      question("nationalities", "Nacionalidad o nacionalidades", "text", {
        required: true,
      }),
      question("irccUci", "UCI de IRCC, si lo conoce"),
      question("desiredProcess", "Tipo de trámite que desea realizar", "text", {
        required: true,
      }),
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
      question("currentStatus", "Estatus en ese país", "text", {
        required: true,
      }),
      question("currentStatusOther", "Si su estatus es “otro”, explique"),
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
          question("status", "Estatus migratorio", "text", { required: true }),
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
    ],
  },
  {
    key: "civil-status",
    number: 3,
    title: "Estado civil y pareja actual",
    items: [
      question("civilStatus", "Estado civil actual", "text", {
        required: true,
      }),
      question("marriageDate", "Fecha de matrimonio, si corresponde", "date"),
      question(
        "commonLawSince",
        "Si convive en unión de hecho, indique desde cuándo viven juntos de manera continua",
        "date",
      ),
      question("partnerGivenNames", "Nombres de su esposo/a o pareja"),
      question("partnerSurnames", "Apellidos de su esposo/a o pareja"),
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
        { options: ["Inglés", "Francés", "No aplica"] },
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
      question("passportNumber", "Número", "text", { required: true }),
      question("passportCountry", "País emisor", "text", { required: true }),
      question("passportIssuedAt", "Fecha de emisión", "date", {
        required: true,
      }),
      question("passportExpiresAt", "Fecha de vencimiento", "date", {
        required: true,
      }),
      question(
        "taiwanPassportWithPersonalId",
        "¿Utilizará un pasaporte emitido por el Ministerio de Relaciones Exteriores de Taiwán que incluya su número de identificación personal?",
        "yes-no",
        { required: true },
      ),
      question(
        "israeliNationalPassport",
        "¿Utilizará un pasaporte nacional israelí?",
        "yes-no",
        { required: true },
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
        "¿Tiene cédula o documento nacional de identidad?",
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
        "sameMailingAddress",
        "¿Su dirección para recibir correspondencia es la misma?",
        "yes-no",
        { required: true },
      ),
      question(
        "mailingAddress",
        "Dirección postal completa, incluyendo apartado postal si utiliza uno",
        "textarea",
        { required: true, visibleWhen: no("sameMailingAddress") },
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
      question("primaryPhoneExtension", "Extensión, si corresponde"),
      question(
        "alternatePhone",
        "Teléfono alternativo con código de país",
        "phone",
      ),
      question(
        "alternatePhoneTypeAndExtension",
        "Tipo y extensión, si corresponde",
      ),
      question("fax", "Fax, si tiene", "phone"),
      question("email", "Correo electrónico", "email", { required: true }),
    ],
  },
  {
    key: "education",
    number: 10,
    title: "Educación",
    items: [
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
    ],
  },
  {
    key: "additional-information",
    number: 17,
    title: "Información adicional",
    items: [
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
