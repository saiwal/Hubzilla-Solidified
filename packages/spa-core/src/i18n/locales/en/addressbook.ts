import type { RawDictionary } from "../namespaces/types";

export const addressbook: RawDictionary["addressbook"] = {
  contact_count:        "{{count}} contacts",

  // Address books
  new_addressbook:      "New address book",
  addressbook_name:     "Address book name",
  rename_addressbook:   "Rename address book",
  delete_addressbook:   "Delete address book",
  delete_addressbook_confirm:
    "Delete this address book and every contact in it? This cannot be undone.",
  no_addressbooks:      "No address books yet.",
  create:               "Create",
  rename:               "Rename",

  // Import / export
  import_vcf:           "Import vCard (.vcf)",
  importing:            "Importing…",
  import_failed:        "Import failed.",
  export_vcf:           "Export as vCard",

  // Cards
  new_contact:          "New contact",
  edit_contact:         "Edit contact",
  delete_contact:       "Delete contact",
  delete_contact_confirm: "Delete this contact? This cannot be undone.",
  no_contacts:          "No contacts in this address book yet.",
  search_placeholder:   "Search contacts…",
  no_search_results:    "No contacts match your search.",

  // Card fields
  name:                 "Name",
  name_required:        "A name is required.",
  organization:         "Organisation",
  job_title:            "Job title",
  note:                 "Note",
  phone:                "Phone",
  email:                "Email",
  impp:                 "Instant messaging",
  website:              "Website",
  address:              "Address",
  add_phone:            "Add phone",
  add_email:            "Add email",
  add_impp:             "Add instant messaging",
  add_website:          "Add website",
  add_address:          "Add address",
  remove_field:         "Remove",

  // vCard TYPE options — values must stay CELL/HOME/WORK/OTHER
  type_unspecified:     "Unspecified",
  type_mobile:          "Mobile",
  type_home:            "Home",
  type_work:            "Work",
  type_other:           "Other",

  // ADR components, in vCard order
  adr_po_box:           "PO box",
  adr_extended:         "Apartment, suite",
  adr_street:           "Street",
  adr_locality:         "City",
  adr_region:           "Region",
  adr_postcode:         "Postal code",
  adr_country:          "Country",

  // Actions / status
  save:                 "Save",
  saving:               "Saving…",
  cancel:               "Cancel",
  load_error:           "Failed to load address books.",
  save_failed:          "Save failed.",
  delete_failed:        "Delete failed.",
};
