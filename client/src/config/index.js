export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const pharmacyFormControls = [
  {
    label: "Pharmacy Name",
    name: "pharmacyName",
    componentType: "input",
    type: "text",
    placeholder: "Enter Pharmacy Name",
  },
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter Address",
  },
  {
    label: "License Number",
    name: "licenseNumber",
    componentType: "input",
    type: "text",
    placeholder: "Enter License Number",
  },
  {
    label: "Contact Number",
    name: "contactNumber",
    componentType: "input",
    type: "text",
    placeholder: "Enter Contact Number",
  },
  {
    label: "Delivery Available",
    name: "deliveryAvailable",
    componentType: "checkbox",
    type: "checkbox",
  },
];

export const addMedicineFormElements = [
  {
    label: "Medicine Name",
    name: "medicineName",
    componentType: "input",
    type: "text",
    placeholder: "Enter medicine name",
  },

  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter medicine description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "analgesic", label: "Analgesic (Pain Relief)" },
      { id: "antibiotic", label: "Antibiotic" },
      { id: "antidepressant", label: "Antidepressant" },
      { id: "antihypertensive", label: "Antihypertensive" },
      { id: "antacid", label: "Antacid" },
      { id: "diuretic", label: "Diuretic" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "cipla", label: "Cipla" },
      { id: "sun_pharma", label: "Sun Pharma" },
      { id: "pfizer", label: "Pfizer" },
      { id: "gsk", label: "GSK" },
      { id: "abbott", label: "Abbott" },
      { id: "himala_herbal", label: "Himalaya Herbal" },
    ],
  },

  {
    label: "Stock Quantity",
    name: "stockQuantity",
    componentType: "input",
    type: "number",
  },

  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
  },

  {
    label: "Expiry Date",
    name: "expiryDate",
    componentType: "input",
    type: "date",
  },

  {
    label: "Prescription Required",
    name: "isPrescriptionRequired",
    componentType: "select",
    options: [
      { id: true, label: "Yes" },
      { id: false, label: "No (OTC)" },
    ],
  },

  {
    label: "Status",
    name: "status",
    componentType: "select",
    options: [
      { id: "active", label: "Active" },
      { id: "out_of_stock", label: "Out of Stock" },
    ],
  },
];

export const OrderFilterOptions = {
  status: [
    { id: "pending", label: "Pending" },
    { id: "accepted", label: "Accepted" },
    { id: "preparing", label: "Preparing" },
    { id: "out_for_delivery", label: "Out for delivery" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ],
};

export const MedicineFilterOptions = {
  category: [
    { id: "analgesic", label: "Analgesic (Pain Relief)" },
    { id: "antibiotic", label: "Antibiotic" },
    { id: "antidepressant", label: "Antidepressant" },
    { id: "antihypertensive", label: "Antihypertensive" },
    { id: "antacid", label: "Antacid" },
    { id: "diuretic", label: "Diuretic" },
  ],
  brand: [
    { id: "cipla", label: "Cipla" },
    { id: "sun_pharma", label: "Sun Pharma" },
    { id: "pfizer", label: "Pfizer" },
    { id: "gsk", label: "GSK" },
    { id: "abbott", label: "Abbott" },
    { id: "himala_herbal", label: "Himalaya Herbal" },
  ],
};
