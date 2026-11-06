# Almacenamiento de formularios

Cada envío corresponde a una fila de `FormSubmission`. Las columnas relacionales
guardan el formulario, la versión exacta mostrada, la clave utilizada, la persona,
el estado y las fechas. `responses` y `sensitiveResponses` son JSONB: conservan
las preguntas elegidas por el constructor sin crear columnas por cada trámite.

Las claves JSON son los IDs estables de `sections.ts`, no los textos visibles.
Una pregunta simple se guarda como `responses[sectionKey][questionId]`; un grupo
repetible como una lista de objetos en `responses[sectionKey][groupId]`. Las
secciones 12–16 se guardan en `sensitiveResponses`. Las respuestas ocultas por
una condición y las preguntas no elegidas no se guardan.

El catálogo actual contiene 209 campos en 17 bloques. La auditoría recorre
cada pregunta, incluidas las de grupos repetibles, mediante
`pnpm exec tsx scripts/audit-form-sections.ts`.

| Bloque                                    | ID                         | Campos | Destino              |
| ----------------------------------------- | -------------------------- | -----: | -------------------- |
| Datos personales                          | `personal-data`            |     81 | `responses`          |
| Residencia y estatus migratorio           | `residence-status`         |     19 | `responses`          |
| Estado civil y pareja actual              | `civil-status`             |      5 | `responses`          |
| Matrimonios o uniones anteriores          | `previous-relationships`   |      6 | `responses`          |
| Idiomas                                   | `languages`                |      5 | `responses`          |
| Pasaporte o documento de viaje            | `passport`                 |      7 | `responses`          |
| Documento nacional de identidad           | `national-id`              |      5 | `responses`          |
| Residencia permanente en Estados Unidos   | `us-permanent-residence`   |      3 | `responses`          |
| Dirección y contacto                      | `address-contact`          |     31 | `responses`          |
| Educación                                 | `education`                |     12 | `responses`          |
| Empleos y actividades                     | `employment-activities`    |      7 | `responses`          |
| Salud                                     | `health`                   |      3 | `sensitiveResponses` |
| Historial migratorio                      | `immigration-history`      |     12 | `sensitiveResponses` |
| Antecedentes penales                      | `criminal-history`         |      2 | `sensitiveResponses` |
| Servicio militar, policial o de seguridad | `military-police-service`  |      2 | `sensitiveResponses` |
| Organizaciones y otros antecedentes       | `organizations-background` |      3 | `sensitiveResponses` |
| Información adicional                     | `additional-information`   |      6 | `responses`          |

Ejemplo de dos tipos de pregunta en un mismo envío:

```json
{
  "personal-data": { "givenNames": "Ana", "surnames": "Pérez" },
  "residence-status": {
    "previousCountries": [
      {
        "country": "Colombia",
        "status": "Ciudadano",
        "from": "2020-01-01",
        "to": "2024-01-01"
      }
    ]
  }
}
```

`FormTemplateVersion.sections` conserva la definición de cada campo, su etiqueta,
tipo, opciones y condiciones tal como se mostró. El envío apunta a esa versión;
las ediciones posteriores del constructor no cambian la interpretación histórica.
Una versión nueva se crea al abrir por primera vez un formulario cuya definición
cambió. Los envíos anteriores a esta migración preservan sus JSON y pueden tener
`formTemplateVersionId` nulo, porque su definición histórica no existía.

El token es compartido y puede producir muchos envíos de personas distintas.
Por eso no existe un `client_id` deducido de la clave. `personName` y `personEmail`
son datos de consulta extraídos de las respuestas cuando están disponibles.
Los índices relacionales sirven al listado y filtros del panel; no hay un índice
GIN sobre todo el JSONB porque el panel no filtra por respuestas arbitrarias.

La migración cambia la relación token→envíos a `RESTRICT`: eliminar una clave no
puede borrar accidentalmente los formularios que se enviaron con ella. Revocarla
sigue permitida. Las respuestas de salud y antecedentes están separadas y la
interfaz solo las consulta tras autenticar a un administrador; no están cifradas
por la aplicación en la base de datos.
