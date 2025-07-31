// app/constants/privileges.ts
export interface Privilege {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const ALL_PRIVILEGES: Privilege[] = [
  // Management Privileges
  {
    id: "user_management",
    name: "User Management",
    description: "Create, edit, and manage user accounts",
    category: "Management",
  },
  {
    id: "system_settings",
    name: "System Settings",
    description: "Configure system-wide settings",
    category: "Management",
  },
  {
    id: "reports_access",
    name: "Reports Access",
    description: "View all system reports and analytics",
    category: "Management",
  },
  {
    id: "audit_logs",
    name: "Audit Logs",
    description: "View system audit logs and user activities",
    category: "Management",
  },

  // Port Call Privileges
  {
    id: "port_calls_create",
    name: "Create Port Calls",
    description: "Create new port call entries",
    category: "Port Calls",
  },
  {
    id: "port_calls_edit",
    name: "Edit Port Calls",
    description: "Modify existing port call details",
    category: "Port Calls",
  },
  {
    id: "port_calls_delete",
    name: "Delete Port Calls",
    description: "Remove port call entries",
    category: "Port Calls",
  },
  {
    id: "port_calls_view",
    name: "View Port Calls",
    description: "Access port call information",
    category: "Port Calls",
  },
  {
    id: "port_calls_assign",
    name: "Assign Port Calls",
    description: "Assign port calls to staff members",
    category: "Port Calls",
  },

  // Customer Management
  {
    id: "customers_create",
    name: "Create Customers",
    description: "Add new customer companies",
    category: "Customers",
  },
  {
    id: "customers_edit",
    name: "Edit Customers",
    description: "Modify customer information",
    category: "Customers",
  },
  {
    id: "customers_view",
    name: "View Customers",
    description: "Access customer database",
    category: "Customers",
  },
  {
    id: "customers_delete",
    name: "Delete Customers",
    description: "Remove customer records",
    category: "Customers",
  },

  // Vendor Management
  {
    id: "vendors_create",
    name: "Create Vendors",
    description: "Add new vendor companies",
    category: "Vendors",
  },
  {
    id: "vendors_edit",
    name: "Edit Vendors",
    description: "Modify vendor information",
    category: "Vendors",
  },
  {
    id: "vendors_view",
    name: "View Vendors",
    description: "Access vendor database",
    category: "Vendors",
  },
  {
    id: "vendors_delete",
    name: "Delete Vendors",
    description: "Remove vendor records",
    category: "Vendors",
  },

  // Document Management
  {
    id: "documents_create",
    name: "Create Documents",
    description: "Upload and create new documents",
    category: "Documents",
  },
  {
    id: "documents_edit",
    name: "Edit Documents",
    description: "Modify document details",
    category: "Documents",
  },
  {
    id: "documents_view",
    name: "View Documents",
    description: "Access document library",
    category: "Documents",
  },
  {
    id: "documents_delete",
    name: "Delete Documents",
    description: "Remove documents",
    category: "Documents",
  },

  // Communication
  {
    id: "messages_send",
    name: "Send Messages",
    description: "Send internal messages",
    category: "Communication",
  },
  {
    id: "messages_view",
    name: "View Messages",
    description: "Access messaging system",
    category: "Communication",
  },
  {
    id: "whatsapp_access",
    name: "WhatsApp Access",
    description: "Use WhatsApp integration",
    category: "Communication",
  },
  {
    id: "phonebook_manage",
    name: "Manage Phone Book",
    description: "Add/edit/delete contacts",
    category: "Communication",
  },

  // Operations
  {
    id: "vessels_manage",
    name: "Manage Vessels",
    description: "Add and edit vessel information",
    category: "Operations",
  },
  {
    id: "clearance_operations",
    name: "Clearance Operations",
    description: "Handle customs and clearance",
    category: "Operations",
  },
  {
    id: "bunkering_operations",
    name: "Bunkering Operations",
    description: "Manage fuel and bunkering services",
    category: "Operations",
  },

  // Financial
  {
    id: "disbursement_view",
    name: "View Disbursements",
    description: "Access disbursement accounts",
    category: "Financial",
  },
  {
    id: "disbursement_create",
    name: "Create Disbursements",
    description: "Create disbursement entries",
    category: "Financial",
  },
  {
    id: "invoicing",
    name: "Invoicing",
    description: "Generate and manage invoices",
    category: "Financial",
  },
];

// Add this function to get default privileges for access levels
export const getDefaultPrivileges = (accessLevel: string): string[] => {
  switch (accessLevel) {
    case "A": // Managing Director
      return ALL_PRIVILEGES.map((p) => p.id);
    case "B": // Operations Manager
      return [
        "port_calls_create",
        "port_calls_edit",
        "port_calls_view",
        "port_calls_assign",
        "customers_view",
        "customers_edit",
        "vendors_view",
        "vendors_edit",
        "documents_view",
        "documents_create",
        "documents_edit",
        "messages_send",
        "messages_view",
        "vessels_manage",
        "reports_access",
        "clearance_operations",
        "bunkering_operations",
      ];
    case "C": // Disbursement Manager
      return [
        "port_calls_view",
        "port_calls_edit",
        "customers_view",
        "customers_edit",
        "vendors_view",
        "documents_view",
        "documents_create",
        "messages_send",
        "messages_view",
        "disbursement_view",
        "disbursement_create",
        "invoicing",
      ];
    case "D": // Assistant Manager
      return [
        "port_calls_view",
        "port_calls_edit",
        "customers_view",
        "vendors_view",
        "documents_view",
        "documents_create",
        "messages_send",
        "messages_view",
        "vessels_manage",
        "clearance_operations",
      ];
    case "E": // Operations Executive
      return [
        "port_calls_view",
        "customers_view",
        "vendors_view",
        "documents_view",
        "documents_create",
        "messages_send",
        "messages_view",
        "whatsapp_access",
        "phonebook_manage",
      ];
    case "F": // Bunkering Officer
      return [
        "port_calls_view",
        "vendors_view",
        "documents_view",
        "messages_send",
        "messages_view",
        "bunkering_operations",
      ];
    case "G": // Clearance Officer
      return [
        "port_calls_view",
        "vendors_view",
        "documents_view",
        "messages_send",
        "messages_view",
        "clearance_operations",
      ];
    case "R": // General Staff
      return ["port_calls_view", "documents_view", "messages_view"];
    default:
      return [];
  }
};