import type { ReactNode } from "react";

export interface PolicySection {
  title: string;
  body: ReactNode[];
}

/**
 * Numbered heading + paragraphs layout shared by the legal/policy pages
 * (terms, privacy, cookies, returns) so they read as one set.
 */
export function PolicySections({ sections }: { sections: PolicySection[] }) {
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="font-semibold text-foreground">{section.title}</h2>
          {section.body.map((paragraph, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
