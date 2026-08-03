// AMEXAN Presentation Constitution - Volume I: Foundation
// Version 1.0 (Frozen)

// Constitutional Principle 1: Presentation is never allowed to contain clinical logic.
// Constitutional Principle 2: Presentation consumes. It never decides.
// Constitutional Principle 3: Every page is generated.
// Constitutional Principle 4: Everything inherits. No duplication.
// Constitutional Principle 5: Nothing knows screen size. Only the Viewport Engine knows.
// Constitutional Principle 6: Every user experiences the same operating system.
// Constitutional Principle 7: Presentation must never assume hospital, country, language, currency, brand, insurance, theme, specialty, department, profession.
// Constitutional Principle 8: Presentation must degrade gracefully.
// Constitutional Principle 9: Everything is token driven.
// Constitutional Principle 10: The UI exists to reduce cognitive load.

export interface ConstitutionDocument {
  version: "1.0";
  frozen: true;
  principles: string[];
}

export const presentationConstitution: ConstitutionDocument = {
  version: "1.0",
  frozen: true,
  principles: [
    "Presentation is never allowed to contain clinical logic.",
    "Presentation consumes. It never decides.",
    "Every page is generated.",
    "Everything inherits. No duplication.",
    "Nothing knows screen size. Only the Viewport Engine knows.",
    "Every user experiences the same operating system.",
    "Presentation must never assume hospital, country, language, currency, brand, insurance, theme, specialty, department, profession.",
    "Presentation must degrade gracefully.",
    "Everything is token driven.",
    "The UI exists to reduce cognitive load.",
  ],
};
