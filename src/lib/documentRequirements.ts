export interface DocumentRequirement {
  name: string;
  isMandatory: boolean;
}

export const DOCUMENT_REQUIREMENTS: Record<string, DocumentRequirement[]> = {
  Health: [
    { name: "Aadhar Card", isMandatory: true },
    { name: "Pan Card", isMandatory: true },
    { name: "Passport", isMandatory: true },
    { name: "Birth Certificate", isMandatory: true },
    { name: "School Leaving Certificate", isMandatory: true },
    { name: "Utility Bill", isMandatory: true },
    { name: "Rental Agreement", isMandatory: true },
    { name: "Bank Statement", isMandatory: true },
    { name: "Salary Slips", isMandatory: true },
    { name: "IT Returns", isMandatory: true },
    { name: "Recent Medical Checkup Report", isMandatory: false },
  ],
  Life: [
    { name: "Aadhar Card", isMandatory: true },
    { name: "Pan Card", isMandatory: true },
    { name: "Passport", isMandatory: true },
    { name: "Birth Certificate", isMandatory: true },
    { name: "School Leaving Certificate", isMandatory: true },
    { name: "Utility Bill", isMandatory: true },
    { name: "Rental Agreement", isMandatory: true },
    { name: "Bank Statement", isMandatory: true },
    { name: "Salary Slips", isMandatory: true },
    { name: "IT Returns", isMandatory: true },
    { name: "Medical Examination Report", isMandatory: true },
    { name: "Nominee Aadhar Card", isMandatory: true },
    { name: "Nominee Pan Card", isMandatory: true },
    { name: "Relationship Proof", isMandatory: true },
  ],
  General: [
    { name: "Aadhar Card", isMandatory: true },
    { name: "Pan Card", isMandatory: true },
    { name: "Passport", isMandatory: true },
    { name: "Utility Bill", isMandatory: true },
    { name: "Rental Agreement", isMandatory: true },
    { name: "Bank Statement", isMandatory: true },
  ],
  Vehicle: [
    { name: "Vehicle Registration Certificate", isMandatory: true },
    { name: "Vehicle Photos", isMandatory: true },
    { name: "Aadhar Card", isMandatory: true },
    { name: "Pan Card", isMandatory: true },
    { name: "Passport", isMandatory: true },
    { name: "Utility Bill", isMandatory: true },
    { name: "Rental Agreement", isMandatory: true },
    { name: "Existing Insurance Policy Document", isMandatory: false },
  ],
};
