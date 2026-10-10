import type { AssuranceItem, FaqItem } from "../../content/agendar";
import { Icon } from "../ui/icon";

type BookingAssurancesProps = {
  faqTitle: string;
  faq: readonly FaqItem[];
  assurances: readonly AssuranceItem[];
};

/**
 * Lo que da tranquilidad antes de pagar: preguntas frecuentes (incluida la
 * política de reprogramación y reembolsos) y garantías institucionales.
 */
export function BookingAssurances({
  faqTitle,
  faq,
  assurances,
}: BookingAssurancesProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 rounded-xl border border-surface-container bg-surface-container-lowest p-5">
        <h2 className="flex items-center gap-2 border-b border-surface-container pb-3 font-label-md text-label-md tracking-wider text-on-surface uppercase">
          <Icon name="help" className="text-[20px] text-primary" />
          {faqTitle}
        </h2>
        <dl className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {faq.map(({ question, answer }) => (
            <div
              key={question}
              className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-4"
            >
              <dt className="font-label-md text-label-md text-on-surface">
                {question}
              </dt>
              <dd className="font-body-md text-caption text-on-surface-variant">
                {answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {assurances.map(({ icon, title, detail }) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-lg border border-surface-container bg-surface-container-lowest p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
              <Icon name={icon} className="text-[20px]" />
            </span>
            <span className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">
                {title}
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                {detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
