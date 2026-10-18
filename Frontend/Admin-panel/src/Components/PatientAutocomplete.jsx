import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, User, Phone, Mail, Hash, Loader2, AlertCircle, Check } from "lucide-react";
import api from "../Api/axios";
import { getPatientDisplayName, getPatientIdentifier } from "../Utils/patientUtils";

/**
 * Google-Style Patient Autocomplete Search Component
 *
 * Provides a responsive, accessible, keyboard-navigable autocomplete search
 * for filtering records by patient across Vitals, Medications, Prescriptions, and Reports.
 *
 * Props:
 * @param {Object|null} selectedPatient - The currently selected patient object (or null for "All Patients")
 * @param {Function} onSelectPatient - Callback (patient | null) invoked when a patient is selected or cleared
 * @param {Array} [patients] - Optional array of authorized patient objects. If omitted, fetches from /users
 * @param {string} [placeholder] - Custom placeholder text
 * @param {string} [className] - Additional CSS class for the container
 * @param {string} [id] - Optional ID for accessibility
 */
export default function PatientAutocomplete({
  selectedPatient = null,
  onSelectPatient,
  patients: externalPatients = null,
  placeholder = "Search patient by name, phone, or ID...",
  className = "",
  id = "patient-autocomplete-input",
}) {
  const [internalPatients, setInternalPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Search input text state
  const [inputValue, setInputValue] = useState(() =>
    selectedPatient ? getPatientDisplayName(selectedPatient) : ""
  );

  // Dropdown open state & keyboard highlight index
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs for outside click & dropdown scroll
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // 1. Fetch authorized patients if not provided externally
  useEffect(() => {
    if (Array.isArray(externalPatients)) {
      setInternalPatients(externalPatients);
      return;
    }

    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoadingPatients(true);
        setFetchError(null);
        const res = await api.get("/users");
        const list = Array.isArray(res?.data?.users)
          ? res.data.users
          : Array.isArray(res?.data)
          ? res.data
          : [];

        if (isMounted) {
          // Keep only patient roles if role is present, or all users
          const patientsOnly = list.filter(
            (u) => !u.role || u.role === "patient"
          );
          setInternalPatients(patientsOnly.length > 0 ? patientsOnly : list);
        }
      } catch (err) {
        console.error("PatientAutocomplete fetch error:", err);
        if (isMounted) {
          setFetchError("Unable to load patient list");
        }
      } finally {
        if (isMounted) setLoadingPatients(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [externalPatients]);

  const allPatients = useMemo(() => {
    return Array.isArray(externalPatients) ? externalPatients : internalPatients;
  }, [externalPatients, internalPatients]);

  // 2. Synchronize input text with external selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      setInputValue(getPatientDisplayName(selectedPatient));
    } else {
      // If no patient is selected and dropdown is not currently focused/typing, clear input
      if (!isOpen) {
        setInputValue("");
      }
    }
  }, [selectedPatient, isOpen]);

  // 3. Filter matching patients based on search input
  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];

    return allPatients.filter((p) => {
      const firstName = (p?.firstName || "").toLowerCase();
      const lastName = (p?.lastName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const name = (p?.name || "").toLowerCase();
      const phone = (p?.phone || "").toLowerCase();
      const email = (p?.email || "").toLowerCase();
      const patientId = (p?.patientId || "").toLowerCase();
      const rawId = String(p?._id || p?.id || "").toLowerCase();

      return (
        fullName.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        patientId.includes(query) ||
        rawId.includes(query)
      );
    });
  }, [inputValue, allPatients]);

  // 4. Handle input changes: Open dropdown when typing
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setHighlightedIndex(-1);

    if (val.trim()) {
      setIsOpen(true);
    } else {
      // If input cleared completely, reset selected patient filter
      setIsOpen(false);
      if (selectedPatient) {
        onSelectPatient?.(null);
      }
    }
  };

  // 5. Handle selecting a patient
  const handleSelectPatient = (patient) => {
    onSelectPatient?.(patient);
    setInputValue(getPatientDisplayName(patient));
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // 6. Handle clearing the search
  const handleClear = () => {
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectPatient?.(null);
    inputRef.current?.focus();
  };

  // 7. Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && inputValue.trim()) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectPatient(suggestions[highlightedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Reset input value back to current selected patient (or empty)
        setInputValue(selectedPatient ? getPatientDisplayName(selectedPatient) : "");
        break;

      case "Tab":
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  // 8. Auto-scroll highlighted suggestion into view in dropdown
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("[data-autocomplete-item]");
      const target = items[highlightedIndex];
      if (target) {
        target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex]);

  // 9. Close dropdown on click outside without selecting typed text
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Revert to selected patient if uncommitted text was left
        if (selectedPatient) {
          setInputValue(getPatientDisplayName(selectedPatient));
        } else {
          setInputValue("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedPatient]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? "z-50" : "z-20"} ${className}`}
      style={{ zIndex: isOpen ? 9999 : "auto" }}
    >
      {/* SEARCH INPUT BAR */}
      <div className="relative flex items-center group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          {loadingPatients ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 rounded-xl border border-slate-200 bg-[#F8FAFC] pl-11 pr-24 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 transition-all duration-200 shadow-sm"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-suggestions`}
        />

        {/* RIGHT ACTION BUTTONS */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {selectedPatient && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60 pointer-events-none">
              <Check className="w-3 h-3 text-blue-600" />
              Filtered
            </span>
          )}

          {(inputValue || selectedPatient) && (
            <button
              type="button"
              onClick={handleClear}
              className="w-7 h-7 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors duration-200"
              title="Clear search filter (show all patients)"
              aria-label="Clear patient filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* AUTOCOMPLETE DROPDOWN */}
      {isOpen && inputValue.trim() && (
        <div
          ref={dropdownRef}
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 w-full max-h-72 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/25 z-[9999] py-1.5 divide-y divide-slate-100"
          style={{ minWidth: "100%", zIndex: 9999 }}
        >
          {fetchError ? (
            <div className="px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((patient, index) => {
              const displayName = getPatientDisplayName(patient);
              const identifier = getPatientIdentifier(patient);
              const isSelected =
                selectedPatient &&
                (String(selectedPatient._id || selectedPatient.id) ===
                  String(patient._id || patient.id));
              const isHighlighted = highlightedIndex === index;

              return (
                <div
                  key={patient._id || patient.id || index}
                  data-autocomplete-item
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    // Prevent input blur before click registers
                    e.preventDefault();
                    handleSelectPatient(patient);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isHighlighted
                      ? "bg-blue-50/80 text-blue-900"
                      : isSelected
                      ? "bg-slate-50 text-slate-900"
                      : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* AVATAR */}
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden font-bold text-xs">
                      {patient.profilePic ? (
                        <img
                          src={patient.profilePic}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        displayName.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                      )}
                    </div>

                    {/* NAME & IDENTIFIER */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-[#0F172A]">
                          {displayName}
                        </span>
                        {patient.subscription && patient.subscription !== "free" && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            {patient.subscription}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5 truncate">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="hidden sm:flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {patient.email}
                          </span>
                        )}
                        {patient.patientId && (
                          <span className="flex items-center gap-0.5 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            ID: {patient.patientId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SELECTION BADGE */}
                  {isSelected && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 flex-shrink-0">
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Active</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">No matching patients found</p>
              <p className="text-xs text-[#64748B] mt-1">
                Try searching by a different name, phone number, or ID
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
