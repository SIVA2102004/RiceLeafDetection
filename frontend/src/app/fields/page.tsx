"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { FarmerField } from "@/types";
import { Sprout, Plus, MapPin, Calendar, Trash2 } from "lucide-react";

export default function FieldsPage() {
  const [fields, setFields] = useState<FarmerField[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [area, setArea] = useState("2.5");
  const [variety, setVariety] = useState("BPT-5204 (Samba Mahsuri)");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFields = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/fields`);
      if (res.ok) {
        const data = await res.json();
        setFields(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          village,
          area: parseFloat(area),
          area_unit: "acres",
          variety,
          notes,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setVillage("");
        fetchFields();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/fields/${id}`, { method: "DELETE" });
      setFields((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span>My Rice Fields</span>
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Track individual plots, sowing dates, paddy cultivars, and zone-specific disease incidents.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Field</span>
        </button>
      </div>

      {/* Fields Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">Loading field registry...</div>
      ) : fields.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <p className="text-stone-500 text-sm">No fields registered yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Register Your First Field
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div
              key={f.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-3 relative hover:border-emerald-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">{f.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{f.village || "Registered Farm"}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 transition"
                  title="Delete field"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                <div>
                  <span className="text-stone-400">Total Area</span>
                  <p className="font-semibold text-stone-800 mt-0.5">{f.area} {f.area_unit}</p>
                </div>
                <div>
                  <span className="text-stone-400">Paddy Cultivar</span>
                  <p className="font-semibold text-stone-800 mt-0.5 truncate">{f.variety || "Local Paddy"}</p>
                </div>
              </div>

              {f.notes && (
                <p className="text-xs text-stone-600 italic">"{f.notes}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Field Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-lg text-stone-900">Register New Rice Field</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Field / Plot Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Canal Plot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Village / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Anand"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Rice Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Plot Notes</label>
                <textarea
                  placeholder="Soil type, canal access, sowing details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-xl shadow"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
